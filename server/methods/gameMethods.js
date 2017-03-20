import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {Profiles} from '/collections/profiles.js';
import {Config} from '/imports/lib/config.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import StreamInitiator from '/imports/game/server/StreamInitiator.js';
import {updateProfilesOnGameFinish} from '/server/lib/game.js';

let serverStreams = {};

Meteor.methods({
	createGame: function() {
		const user = Meteor.user();
		let id = null;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to create a game');
		}

		do {
			try {
				id = Games.insert({
					_id: Random.id(5),
					status: Constants.GAME_STATUS_REGISTRATION,
					createdAt: getUTCTimeStamp(),
					createdBy: user._id,
					creatorName: user.profile.name,
					isPrivate: 0,
					hasBonuses: 1,
					hostPoints: 0,
					clientPoints: 0,
					lastPointTaken: null,
					activeBonuses: [],
					viewers: 0
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
		const user = Meteor.user();
		const game = Games.findOne(gameId);

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update game privacy property');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.createdBy != user._id) {
			throw new Meteor.Error('not-allowed', 'Only the creator can update this game privacy');
		}

		Games.update({_id: game._id}, {$set: {isPrivate: isPrivate ? 1 : 0}});
	},

	joinGame: function(gameId, isReady) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to join a game');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		player = Players.findOne({gameId: gameId, userId: user._id});
		if (player) {
			throw new Meteor.Error('not-allowed', 'Already joined');
		}

		return Meteor.call('addPlayerToGame', gameId, isReady);
	},

	addPlayerToGame: function(gameId, isReady) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		const profile = Profiles.findOne({userId: this.userId});

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to add player to a game');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (isReady === undefined) {
			isReady = false;
		}

		let shape = Constants.PLAYER_DEFAULT_SHAPE;
		if (profile && profile.lastShapeUsed) {
			shape = profile.lastShapeUsed;
		}

		let playerId = Players.insert({
			userId: user._id,
			name: user.profile.name,
			gameId: gameId,
			joinedAt: getUTCTimeStamp(),
			isReady: isReady,
			hasQuit: false,
			shape: shape
		});

		return {
			_id: playerId
		};
	},

	updatePlayerShape: function(gameId, shape) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update your player shape');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== Constants.GAME_STATUS_REGISTRATION) {
			throw new Meteor.Error('not-allowed', 'Game already started');
		}

		player = Players.findOne({gameId: gameId, userId: user._id});
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
		Profiles.update({userId: this.userId}, {$set: {'lastShapeUsed': shape}});
	},

	setPlayerIsReady: function(gameId) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to set player ready');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		player = Players.findOne({gameId: gameId, userId: user._id});
		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		Players.update({_id: player._id}, {$set: {isReady: true}});
	},

	leaveGame: function(gameId) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to leave a game');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== Constants.GAME_STATUS_REGISTRATION) {
			throw new Meteor.Error('not-allowed', 'Game already started');
		}

		player = Players.findOne({gameId: gameId, userId: user._id});

		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		Players.remove(player._id);

		//if player is game creator, remove game and all players
		if (game.createdBy === user._id) {
			//Remove all players
			Players.remove({gameId: game._id});
			//Remove game
			Games.remove(game._id);
		}
	},

	startGame: function(gameId) {
		let game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		let data = {
			status: Constants.GAME_STATUS_STARTED,
			startedAt: getUTCTimeStamp(),
			lastPointAt: getUTCTimeStamp(),
			pointsDuration: []
		};

		Games.update({_id: gameId}, {$set: data});

		ServerStream.emit('play-' + gameId, 'play');

		serverStreams[gameId] = new StreamInitiator(gameId);
		serverStreams[gameId].start();
	},

	addGameViewer: function(gameId) {
		let game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		Games.update({_id: gameId}, {$set: {viewers: game.viewers + 1}});
	},

	removeGameViewer: function(gameId) {
		let game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		Games.update({_id: gameId}, {$set: {viewers: game.viewers - 1}});
	},

	quitGame: function(gameId) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to quit a game');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		//If game has not started, leaveGame instead
		if (game.status === Constants.GAME_STATUS_REGISTRATION) {
			Meteor.call('leaveGame', gameId);
		} else if (game.status !== Constants.GAME_STATUS_FINISHED) {
			player = Players.findOne({userId: user._id, gameId: gameId});

			if (!player) {
				throw new Meteor.Error(404, 'Player not found');
			}

			Players.update({_id: player._id}, {$set: {hasQuit: getUTCTimeStamp()}});

			if (serverStreams[gameId]) {
				serverStreams[gameId].stop();
				delete serverStreams[gameId];
			}

			if (game.status === Constants.GAME_STATUS_STARTED) {
				Games.update({_id: game._id}, {$set: {status: Constants.GAME_STATUS_TIMEOUT}});
			}
		}
	},

	keepPlayerAlive: function(playerId) {
		const player = Players.findOne(playerId);

		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		Players.update({_id: playerId}, {$set: {lastKeepAlive: getUTCTimeStamp()}});
	},

	removeTimeoutPlayersAndGames: function() {
		const games = Games.find({status: {$in: [Constants.GAME_STATUS_STARTED]}});
		const gameIds = [];

		games.forEach(function(game) {
			gameIds.push(game._id);
		});

		if (gameIds.length) {
			let timedOutPlayers = Players.find({gameId: {$in: gameIds}, lastKeepAlive: {$lt: (getUTCTimeStamp() - Config.keepAliveTimeOutInterval)}});
			let timedOutPlayersByGameId = {};

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
					for (let player of timedOutPlayersByGameId[game._id]) {
						Players.update({_id: player._id}, {$set: {hasQuit: player.lastKeepAlive}});
					}

					Games.update({_id: game._id}, {$set: {status: Constants.GAME_STATUS_TIMEOUT}});
				}
			});
		}
	},

	addGamePoints: function(gameId, columnName) {
		const game = Games.findOne(gameId);
		const data = {};

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

		data['activeBonuses'] = [];
		data['lastPointAt'] = getUTCTimeStamp();
		data['pointsDuration'] = [].concat(game.pointsDuration).concat([data['lastPointAt'] - game.lastPointAt]);

		let isGameFinished = false;
		if (data[columnName] >= Constants.MAXIMUM_POINTS) {
			data['status'] = Constants.GAME_STATUS_FINISHED;
			data['finishedAt'] = getUTCTimeStamp();
			data['gameDuration'] = data['finishedAt'] - game.startedAt;
			isGameFinished = true;
		}

		Games.update({_id: game._id}, {$set: data});

		if (isGameFinished) {
			updateProfilesOnGameFinish(game._id, columnName);
		}
	}
});
