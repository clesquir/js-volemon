import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration.js';
import {POSSIBLE_NO_PLAYERS} from '/imports/api/games/constants.js';
import GameForfeited from '/imports/api/games/events/GameForfeited.js';
import GameTimedOut from '/imports/api/games/events/GameTimedOut.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import GameInitiator from '/imports/api/games/server/GameInitiator.js';
import {finishGame} from '/imports/api/games/server/onGameFinished.js';
import {PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {
	GAME_STATUS_FORFEITED,
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import {isForfeiting, isGameStatusFinished} from '/imports/api/games/utils.js';
import {playersCanPlayTournament} from '/imports/api/tournaments/utils.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';

/**
 * @param {string} userId
 * @param {GameInitiator[]} gameInitiators
 * @param modeSelection
 * @param tournamentId
 * @returns {string}
 */
export const createGame = function(userId, gameInitiators, modeSelection, tournamentId = null) {
	let id = null;

	const userConfiguration = UserConfigurations.findOne({userId: userId});
	let username = '';
	if (userConfiguration) {
		username = userConfiguration.name;
	}

	if (!playersCanPlayTournament(tournamentId, [{userId: userId}])) {
		throw new Meteor.Error('not-allowed', 'Cannot join this tournament');
	}

	do {
		try {
			id = Games.insert({
				_id: Random.id(5),
				modeSelection: modeSelection,
				tournamentId: tournamentId,
				status: GAME_STATUS_REGISTRATION,
				createdAt: getUTCTimeStamp(),
				createdBy: userId,
				hostId: userId,
				hostName: username,
				clientId: null,
				clientName: null,
				isPracticeGame: 0,
				isPrivate: 0,
				hostPoints: 0,
				clientPoints: 0,
				lastPointTaken: null,
				activeBonuses: [],
				viewers: 0
			});
		} catch (e) {
			//If the id is already taken loop until it finds a unique id
			if (e.code !== 11000) {
				throw e;
			}
		}
	} while (id === null);

	const configuration = new DefaultGameConfiguration(id);
	Games.update({_id: id}, {$set: {forfeitMinimumPoints: configuration.forfeitMinimumPoints()}});
	Games.update({_id: id}, {$set: {maximumPoints: configuration.maximumPoints()}});
	Games.update({_id: id}, {$set: {hasBonuses: configuration.hasBonuses()}});
	Games.update({_id: id}, {$set: {listOfShapes: configuration.listOfShapes()}});
	Games.update({_id: id}, {$set: {allowedListOfShapes: configuration.allowedListOfShapes()}});

	gameInitiators[id] = new GameInitiator(id);
	gameInitiators[id].init();

	return id;
};

/**
 * @param {string} userId
 * @param {string} gameId
 * @param {boolean} isReady
 * @returns {*}
 */
export const joinGame = function(userId, gameId, isReady = false) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	const player = Players.findOne({gameId: gameId, userId: userId});
	if (player) {
		throw new Meteor.Error('not-allowed', 'Already joined');
	}

	const players = Players.find({gameId: gameId});
	if (players.count() >= POSSIBLE_NO_PLAYERS) {
		throw new Meteor.Error('not-allowed', 'Maximum players reached');
	}

	if (!playersCanPlayTournament(game.tournamentId, [{userId: userId}])) {
		throw new Meteor.Error('not-allowed', 'Cannot join this tournament');
	}

	const userConfiguration = UserConfigurations.findOne({userId: userId});
	let username = '';
	let selectedShape = PLAYER_DEFAULT_SHAPE;
	if (userConfiguration) {
		username = userConfiguration.name;
		if (userConfiguration.lastShapeUsed) {
			selectedShape = userConfiguration.lastShapeUsed;
		}
	}

	if (userId !== game.hostId) {
		Games.update(
			{_id: gameId},
			{$set: {
				clientId: userId,
				clientName: username
			}}
		);
	}

	const allowedListOfShapes = game.allowedListOfShapes || [];
	const listOfShapes = game.listOfShapes || [];

	if (allowedListOfShapes.indexOf(selectedShape) === -1) {
		selectedShape = allowedListOfShapes[0];
	}

	let shape = selectedShape;
	if (selectedShape === PLAYER_SHAPE_RANDOM) {
		shape = Random.choice(listOfShapes);
	}

	return Players.insert({
		userId: userId,
		name: username,
		gameId: gameId,
		joinedAt: getUTCTimeStamp(),
		isReady: isReady,
		askedForRematch: undefined,
		hasQuit: false,
		selectedShape: selectedShape,
		shape: shape
	});
};

/**
 * @param {string} gameId
 * @param {GameInitiator[]} gameInitiators
 */
export const startGame = function(gameId, gameInitiators) {
	let game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	const players = Players.find({gameId: gameId});
	if (!playersCanPlayTournament(game.tournamentId, players)) {
		throw new Meteor.Error('not-allowed', 'One of the players cannot join this tournament');
	}

	let data = {
		status: GAME_STATUS_STARTED,
		startedAt: getUTCTimeStamp(),
		lastPointAt: getUTCTimeStamp(),
		pointsDuration: [],
		pointsSide: []
	};

	Games.update({_id: gameId}, {$set: data});

	if (gameInitiators[gameId]) {
		gameInitiators[gameId].start();
	}
};

/**
 * @param {string} userId
 * @param {string} gameId
 * @param {boolean} accepted
 * @param {GameInitiator[]} gameInitiators
 */
export const replyRematch = function(userId, gameId, accepted, gameInitiators) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	if (!isGameStatusFinished(game.status)) {
		throw new Meteor.Error('not-allowed', 'Only finished games can be rematched');
	}

	const player = Players.findOne({gameId: gameId, userId: userId});
	if (!player) {
		throw new Meteor.Error(404, 'Player not found');
	}

	Players.update({_id: player._id}, {$set: {askedForRematch: accepted}});

	const notAskingForRematch = Players.find({gameId: gameId, askedForRematch: {$ne: true}});
	if (notAskingForRematch.count() === 0 && !game.rematchInCreation) {
		Games.update({_id: game._id}, {$set: {rematchInCreation: true}});

		const clientPlayer = Players.findOne({gameId: gameId, userId: {$ne: game.createdBy}});

		const gameRematchId = createGame(clientPlayer.userId, gameInitiators, game.modeSelection, game.tournamentId);

		Games.update(
			{_id: gameRematchId},
			{$set: {isPracticeGame: game.isPracticeGame, isPrivate: game.isPrivate}}
		);

		joinGame(clientPlayer.userId, gameRematchId, true);
		joinGame(game.createdBy, gameRematchId, true);

		Games.update({_id: game._id}, {$set: {rematchGameId: gameRematchId}});

		Meteor.setTimeout(() => {
			startGame(gameRematchId, gameInitiators);
		}, 5000);
	}
};

export const onPlayerQuit = function(player) {
	const game = Games.findOne(player.gameId);

	if (game.status !== GAME_STATUS_REGISTRATION) {
		if (isForfeiting(game)) {
			Players.update({_id: player._id}, {$set: {hasForfeited: true}});
			Games.update({_id: game._id}, {$set: {status: GAME_STATUS_FORFEITED}});

			let winnerUserId = null;
			if (player.userId === game.hostId) {
				winnerUserId = game.clientId;
			} else {
				winnerUserId = game.hostId;
			}

			finishGame(game._id, winnerUserId, player.userId);
			EventPublisher.publish(new GameForfeited(game._id));
		} else if (game.status === GAME_STATUS_STARTED) {
			Games.update({_id: game._id}, {$set: {status: GAME_STATUS_TIMEOUT}});
			EventPublisher.publish(new GameTimedOut(game._id));
		}
	}
};
