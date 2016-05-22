Meteor.methods({
	createGame: function() {
		var user = Meteor.user(),
			id = null;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to create a game');
		}

		do {
			try {
				id = Games.insert({
					_id: Random.id(5),
					status: Constants.GAME_STATUS_REGISTRATION,
					createdAt: new Date().getTime(),
					createdBy: user._id,
					isPrivate: 0,
					hostPoints: 0,
					clientPoints: 0,
					lastPointTaken: null
				});
			} catch (e) {
				//If the id is already taken loop until it finds a unique id
				if (e.code != 11000) {
					throw e;
				}
			}
		} while (id == null);

		Meteor.call('joinGame', id, true);

		return id;
	},

	updateGamePrivacy: function(gameId, isPrivate) {
		var game = Games.findOne(gameId),
			user = Meteor.user();

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.createdBy != user._id) {
			throw new Meteor.Error('not-allowed', 'Only the creator can update this game privacy');
		}

		Games.update({_id: game._id}, {$set: {isPrivate: isPrivate ? 1 : 0}});
	},

	joinGame: function(gameId, isReady) {
		check(this.userId, String);

		var user = Meteor.user(),
			game = Games.findOne(gameId),
			player = Players.findOne({gameId: gameId, userId: user._id});

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (player) {
			throw new Meteor.Error('not-allowed', 'Already joined');
		}

		return Meteor.call('addPlayerToGame', gameId, isReady);
	},

	addPlayerToGame: function(gameId, isReady) {
		var user = Meteor.user(),
			game = Games.findOne(gameId);

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to join a game');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (isReady === undefined) {
			isReady = false;
		}

		let playerId = Players.insert({
			userId: user._id,
			name: user.profile.name,
			gameId: gameId,
			joinedAt: new Date().getTime(),
			isReady: isReady,
			lastKeepAlive: new Date().getTime(),
			shape: Constants.PLAYER_DEFAULT_SHAPE
		});

		return {
			_id: playerId
		};
	},

	updatePlayerShape: function(gameId, shape) {
		check(this.userId, String);

		var game = Games.findOne(gameId),
			user = Meteor.user(),
			player = Players.findOne({gameId: gameId, userId: user._id});

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== Constants.GAME_STATUS_REGISTRATION) {
			throw new Meteor.Error('not-allowed', 'Game already started');
		}

		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		if (Constants.PLAYER_LIST_OF_SHAPES.indexOf(shape) === -1) {
			throw new Meteor.Error(
				'not-allowed',
				'The requested shape is not allowed'
			);
		}

		Players.update({_id: player._id}, {$set: {shape: shape}});
	},

	setPlayerIsReady: function(gameId) {
		check(this.userId, String);

		var game = Games.findOne(gameId),
			user = Meteor.user(),
			player = Players.findOne({gameId: gameId, userId: user._id});

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		Players.update({_id: player._id}, {$set: {isReady: true}});
	},

	leaveGame: function(gameId) {
		check(this.userId, String);

		var user = Meteor.user();
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: user._id});

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== Constants.GAME_STATUS_REGISTRATION) {
			throw new Meteor.Error('not-allowed', 'Game already started');
		}

		Players.remove(player._id);
	},

	startGame: function(gameId) {
		var game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		var data = {
			status: Constants.GAME_STATUS_STARTED,
			startedAt: new Date().getTime()
		};

		Games.update({_id: game._id}, {$set: data});

		GameStream.emit('play', game._id);
	},

	keepPlayerAlive: function(playerId) {
		var player = Players.findOne(playerId);

		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		Players.update({_id: playerId}, {$set: {lastKeepAlive: new Date().getTime()}});
	},

	removeTimeoutPlayersAndGames: function() {
		var games = Games.find({status: {$nin: [Constants.GAME_STATUS_FINISHED]}}),
			timedOutPlayers = Players.find({lastKeepAlive: {$lt: (new Date().getTime() - Config.keepAliveElapsedForTimeOut)}}),
			timedOutPlayersByGameId = {};

		//Gather players ids and player object by ids
		timedOutPlayers.forEach(function(player) {
			if (timedOutPlayersByGameId[player.gameId] === undefined) {
				timedOutPlayersByGameId[player.gameId] = [];
			}
			timedOutPlayersByGameId[player.gameId].push(player);
		});

		games.forEach(function(game) {
			//If there are timed out players
			if (timedOutPlayersByGameId[game._id] !== undefined) {
				//Check if games have players left
				let playersInGame = Players.find({gameId: game._id});

				if (playersInGame.count() - timedOutPlayersByGameId[game._id].length === 0) {
					for (let player of timedOutPlayersByGameId[game._id]) {
						Players.remove(player._id);
						console.log('Removed timed out player = ' + player._id);
					}

					Games.remove(game._id);
					console.log('Removed game = ' + game._id);
				} else if (game.status === Constants.GAME_STATUS_STARTED) {
					Games.update({_id: game._id}, {$set: {status: Constants.GAME_STATUS_TIMEOUT}});
					console.log('Set game status to timeout = ' + game._id);
				}
			}
		});
	},

	addGamePoints: function(gameId, columnName) {
		var game = Games.findOne(gameId),
			data = {};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status != Constants.GAME_STATUS_STARTED) {
			throw new Meteor.Error('not-allowed', 'Only active games can be updated');
		}

		if ([Constants.HOST_POINTS_COLUMN, Constants.CLIENT_POINTS_COLUMN].indexOf(columnName) === -1) {
			throw new Meteor.Error(
				'not-allowed',
				'Only ' + Constants.HOST_POINTS_COLUMN + ' and ' + Constants.CLIENT_POINTS_COLUMN + ' are allowed'
			);
		}

		data[columnName] = game[columnName] + 1;

		switch (columnName) {
			case Constants.HOST_POINTS_COLUMN:
				data['lastPointTaken'] = Constants.LAST_POINT_TAKEN_HOST;
				break;
			case Constants.CLIENT_POINTS_COLUMN:
				data['lastPointTaken'] = Constants.LAST_POINT_TAKEN_CLIENT;
				break;
		}

		let isGameFinished = false;
		if (data[columnName] >= Config.maximumPoints) {
			data['status'] = Constants.GAME_STATUS_FINISHED;
			isGameFinished = true;
		}

		Games.update({_id: game._id}, {$set: data});

		if (isGameFinished) {
			updateProfilesOnGameFinish(game._id, columnName);
		}
	}
});
