import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import GameTimedOut from '/imports/api/games/events/GameTimedOut.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {
	createGame,
	joinGame,
	startGame,
	replyRematch
} from '/imports/api/games/server/gameSetup.js';
import {onGameFinished} from '/imports/api/games/server/onGameFinished.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {
	HOST_POINTS_COLUMN,
	CLIENT_POINTS_COLUMN,
	HOST_SIDE,
	CLIENT_SIDE,
	GAME_MAXIMUM_POINTS
} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES, PLAYER_ALLOWED_LIST_OF_SHAPES, PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_FINISHED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import {htmlEncode, getUTCTimeStamp} from '/imports/lib/utils.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';

/** @type {GameInitiator[]} */
let gameInitiators = {};

Meteor.methods({
	createGame: function() {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to create a game');
		}

		const id = createGame(user, gameInitiators);

		Meteor.call('joinGame', id, true);

		return id;
	},

	updatePracticeGame: function(gameId, isPracticeGame) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update practice game property');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.createdBy !== user._id) {
			throw new Meteor.Error('not-allowed', 'Only the creator can update the practice game property');
		}

		Games.update({_id: game._id}, {$set: {isPracticeGame: isPracticeGame ? 1 : 0}});
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

		if (game.createdBy !== user._id) {
			throw new Meteor.Error('not-allowed', 'Only the creator can update this game privacy');
		}

		Games.update({_id: game._id}, {$set: {isPrivate: isPrivate ? 1 : 0}});
	},

	joinGame: function(gameId, isReady) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to join a game');
		}

		return joinGame(user, gameId, isReady);
	},

	updatePlayerShape: function(gameId, selectedShape) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);
		let player;

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to update your player shape');
		}

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== GAME_STATUS_REGISTRATION) {
			throw new Meteor.Error('not-allowed', 'Game already started');
		}

		player = Players.findOne({gameId: gameId, userId: user._id});
		if (!player) {
			throw new Meteor.Error(404, 'Player not found');
		}

		if (PLAYER_ALLOWED_LIST_OF_SHAPES.indexOf(selectedShape) === -1) {
			throw new Meteor.Error(
				'not-allowed',
				'The requested shape is not allowed: ' + htmlEncode(selectedShape)
			);
		}

		let shape = selectedShape;
		if (selectedShape === PLAYER_SHAPE_RANDOM) {
			shape = Random.choice(PLAYER_LIST_OF_SHAPES);
		}

		Players.update({_id: player._id}, {$set: {selectedShape: selectedShape, shape: shape}});
		Profiles.update({userId: this.userId}, {$set: {'lastShapeUsed': selectedShape}});
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

		if (game.status !== GAME_STATUS_REGISTRATION) {
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
			Players.remove({gameId: gameId});
			//Remove game
			Games.remove(gameId);

			//Stop streaming
			if (gameInitiators[gameId]) {
				gameInitiators[gameId].stop();
				delete gameInitiators[gameId];
			}
		} else if (user._id !== game.hostId) {
			Games.update(
				{_id: gameId},
				{$set: {
					clientId: null,
					clientName: null
				}}
			);
		}
	},

	startGame: function(gameId) {
		startGame(gameId, gameInitiators);
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
		if (game.status === GAME_STATUS_REGISTRATION) {
			Meteor.call('leaveGame', gameId);
		} else {
			player = Players.findOne({userId: user._id, gameId: gameId});

			if (!player) {
				throw new Meteor.Error(404, 'Player not found');
			}

			Players.update({_id: player._id}, {$set: {hasQuit: getUTCTimeStamp()}});

			if (game.status === GAME_STATUS_STARTED) {
				Games.update({_id: game._id}, {$set: {status: GAME_STATUS_TIMEOUT}});

				EventPublisher.publish(new GameTimedOut(game._id));
			}

			//If there is no active players anymore
			const activePlayers = Players.find({gameId: gameId, hasQuit: false});
			if (activePlayers.count() === 0) {
				//Stop streaming
				if (gameInitiators[gameId]) {
					gameInitiators[gameId].stop();
					delete gameInitiators[gameId];
				}
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

	removeTimeoutPlayersAndGames: function(timeoutInterval) {
		const games = Games.find({status: {$in: [GAME_STATUS_STARTED]}});
		const gameIds = [];

		games.forEach(function(game) {
			gameIds.push(game._id);
		});

		if (gameIds.length) {
			let timedOutPlayers = Players.find({gameId: {$in: gameIds}, lastKeepAlive: {$lt: (getUTCTimeStamp() - timeoutInterval)}});
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

					Games.update({_id: game._id}, {$set: {status: GAME_STATUS_TIMEOUT}});

					EventPublisher.publish(new GameTimedOut(game._id));
				}
			});
		}
	},

	removeVacantGameStreams: function() {
		const gameIds = Object.keys(gameInitiators);
		const players = Players.find({gameId: {$in: gameIds}, hasQuit: false});

		const stillOccupiedGames = [];
		players.forEach(function(player) {
			stillOccupiedGames.push(player.gameId);
		});

		const vacantGameIds = gameIds.filter(function(gameId) {
			return stillOccupiedGames.indexOf(gameId) === -1;
		});

		for (let gameId of vacantGameIds) {
			//Stop streaming
			if (gameInitiators[gameId]) {
				gameInitiators[gameId].stop();
				delete gameInitiators[gameId];
			}
		}
	},

	addGamePoints: function(gameId, columnName) {
		const game = Games.findOne(gameId);
		const data = {};

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		if (game.status !== GAME_STATUS_STARTED) {
			throw new Meteor.Error('not-allowed', 'Only active games can be updated');
		}

		if ([HOST_POINTS_COLUMN, CLIENT_POINTS_COLUMN].indexOf(columnName) === -1) {
			throw new Meteor.Error(
				'not-allowed',
				'Only ' + HOST_POINTS_COLUMN + ' and ' + CLIENT_POINTS_COLUMN + ' are allowed'
			);
		}

		data[columnName] = game[columnName] + 1;

		let pointScoredByHost = false;
		switch (columnName) {
			case HOST_POINTS_COLUMN:
				data['lastPointTaken'] = HOST_SIDE;
				pointScoredByHost = true;
				break;
			case CLIENT_POINTS_COLUMN:
				data['lastPointTaken'] = CLIENT_SIDE;
				break;
		}

		data['activeBonuses'] = [];
		data['lastPointAt'] = getUTCTimeStamp();
		const pointDuration = data['lastPointAt'] - game.lastPointAt;
		data['pointsSide'] = [].concat(game.pointsSide).concat([data['lastPointTaken']]);
		data['pointsDuration'] = [].concat(game.pointsDuration).concat([pointDuration]);

		let isGameFinished = false;
		if (data[columnName] >= GAME_MAXIMUM_POINTS) {
			data['status'] = GAME_STATUS_FINISHED;
			data['finishedAt'] = getUTCTimeStamp();
			data['gameDuration'] = data['finishedAt'] - game.startedAt;
			isGameFinished = true;
		}

		Games.update({_id: game._id}, {$set: data});

		let hostPoints = game.hostPoints;
		if (data[HOST_POINTS_COLUMN] !== undefined) {
			hostPoints = data[HOST_POINTS_COLUMN];
		}
		let clientPoints = game.clientPoints;
		if (data[CLIENT_POINTS_COLUMN] !== undefined) {
			clientPoints = data[CLIENT_POINTS_COLUMN];
		}

		EventPublisher.publish(new PointTaken(game._id, pointDuration, pointScoredByHost, hostPoints, clientPoints));

		if (isGameFinished && !game.isPracticeGame) {
			const clientPlayer = Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});

			let winnerUserId;
			let loserUserId;
			switch (columnName) {
				case HOST_POINTS_COLUMN:
					winnerUserId = game.createdBy;
					loserUserId = clientPlayer.userId;
					break;
				case CLIENT_POINTS_COLUMN:
					winnerUserId = clientPlayer.userId;
					loserUserId = game.createdBy;
					break;
			}

			onGameFinished(game._id, winnerUserId, loserUserId);
			EventPublisher.publish(new GameFinished(game._id, data['gameDuration']));
		}
	},

	replyRematch(gameId, accepted) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to ask for rematch');
		}

		replyRematch(user._id, gameId, accepted, gameInitiators);
	}
});
