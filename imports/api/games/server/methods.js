import {CLIENT_POINTS_COLUMN, CLIENT_SIDE, HOST_POINTS_COLUMN, HOST_SIDE} from '/imports/api/games/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import GameInitiatorCollection from '/imports/api/games/server/GameInitiatorCollection.js';
import {joinGame, onPlayerQuit, replyRematch, startGame} from '/imports/api/games/server/gameSetup.js';
import {finishGame} from '/imports/api/games/server/onGameFinished.js';
import {
	GAME_STATUS_FINISHED,
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED
} from '/imports/api/games/statusConstants.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

Meteor.methods({
	/**
	 * @deprecated
	 * @param gameId
	 * @param isPracticeGame
	 */
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

	/**
	 * @deprecated
	 * @param gameId
	 * @param isPrivate
	 */
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

	/**
	 * @deprecated
	 * @param gameId
	 * @param isReady
	 * @returns {*}
	 */
	joinGame: function(gameId, isReady) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to join a game');
		}

		return joinGame(user._id, gameId, isReady);
	},

	/**
	 * @deprecated
	 * @param gameId
	 */
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

		Games.update({_id: game._id}, {$set: {isReady: true}});
		Players.update({_id: player._id}, {$set: {isReady: true}});
	},

	/**
	 * @deprecated
	 * @param gameId
	 */
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
			GameInitiatorCollection.unset(gameId);
		} else if (user._id !== game.hostId) {
			Games.update(
				{_id: gameId},
				{$set: {
					clientId: null,
					clientName: null,
					isReady: false
				}}
			);
		}
	},

	/**
	 * @deprecated
	 * @param gameId
	 */
	startGame: function(gameId) {
		startGame(gameId, GameInitiatorCollection.get());
	},

	addGameViewer: function(gameId) {
		let game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		for (let i = 0; i < game.viewers.length; i++) {
			if (game.viewers[i].id === this.connection.id) {
				return;
			}
		}

		let viewer = {id: this.connection.id, userId: null, name: 'Guest'};
		if (Meteor.user()) {
			viewer.userId = Meteor.user()._id;
			const userConfiguration = UserConfigurations.findOne({userId: Meteor.user()._id});
			if (userConfiguration) {
				viewer.name = userConfiguration.name;
			}
		}

		Games.update(
			{_id: gameId},
			{$push: {viewers: viewer}}
		);
	},

	removeGameViewer: function(gameId) {
		let game = Games.findOne(gameId);

		if (!game) {
			throw new Meteor.Error(404, 'Game not found');
		}

		Games.update(
			{_id: gameId},
			{$pull: {'viewers': {id: this.connection.id}}}
		);
	},

	quitGame: function(gameId) {
		const user = Meteor.user();
		const game = Games.findOne(gameId);

		if (!user || !game) {
			return;
		}

		const player = Players.findOne({userId: user._id, gameId: gameId});

		if (!player) {
			return;
		}

		//If game has not started, leaveGame instead
		if (game.status === GAME_STATUS_REGISTRATION) {
			Meteor.call('leaveGame', gameId);
		} else {
			Players.update({_id: player._id}, {$set: {hasQuit: getUTCTimeStamp()}});

			onPlayerQuit(player);

			//If there is no active players anymore
			const activePlayers = Players.find({gameId: gameId, hasQuit: false});
			if (activePlayers.count() === 0) {
				//Stop streaming
				GameInitiatorCollection.unset(gameId);
			}
		}
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

						onPlayerQuit(player);
					}
				}
			});
		}
	},

	removeVacantGameStreams: function() {
		const gameIds = Object.keys(GameInitiatorCollection.get());
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
			GameInitiatorCollection.unset(gameId);
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
		if (data[columnName] >= game.maximumPoints) {
			data['status'] = GAME_STATUS_FINISHED;
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

		if (isGameFinished) {
			let winnerUserId;
			let loserUserId;
			switch (columnName) {
				case HOST_POINTS_COLUMN:
					winnerUserId = game.hostId;
					loserUserId = game.clientId;
					break;
				case CLIENT_POINTS_COLUMN:
					winnerUserId = game.clientId;
					loserUserId = game.hostId;
					break;
			}

			finishGame(game._id, winnerUserId, loserUserId);
		}
	},

	replyRematch(gameId, accepted) {
		const user = Meteor.user();

		if (!user) {
			throw new Meteor.Error(401, 'You need to login to ask for rematch');
		}

		replyRematch(user._id, gameId, accepted, GameInitiatorCollection.get());
	}
});
