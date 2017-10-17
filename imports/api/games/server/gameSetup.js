import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {POSSIBLE_NO_PLAYERS} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {PLAYER_LIST_OF_SHAPES, PLAYER_DEFAULT_SHAPE, PLAYER_SHAPE_RANDOM} from '/imports/api/games/shapeConstants.js';
import {
	GAME_STATUS_FORFEITED,
	GAME_STATUS_REGISTRATION,
	GAME_STATUS_STARTED,
	GAME_STATUS_TIMEOUT
} from '/imports/api/games/statusConstants.js';
import {isGameStatusFinished} from '/imports/api/games/utils.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import GameInitiator from '/imports/api/games/server/GameInitiator.js';
import {isForfeiting} from '/imports/api/games/utils.js';
import {finishGame} from '/imports/api/games/server/onGameFinished.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import GameForfeited from '/imports/api/games/events/GameForfeited.js';
import GameTimedOut from '/imports/api/games/events/GameTimedOut.js';

/**
 * @param user
 * @param {GameInitiator[]} gameInitiators
 * @param tournamentId
 * @returns {string}
 */
export const createGame = function(user, gameInitiators, tournamentId = null) {
	let id = null;

	do {
		try {
			id = Games.insert({
				_id: Random.id(5),
				tournamentId: tournamentId,
				status: GAME_STATUS_REGISTRATION,
				createdAt: getUTCTimeStamp(),
				createdBy: user._id,
				hostId: user._id,
				hostName: user.profile.name,
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

	gameInitiators[id] = new GameInitiator(id);
	gameInitiators[id].init();

	return id;
};

/**
 * @param user
 * @param {string} gameId
 * @param {boolean} isReady
 * @returns {*}
 */
export const joinGame = function(user, gameId, isReady = false) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	const player = Players.findOne({gameId: gameId, userId: user._id});
	if (player) {
		throw new Meteor.Error('not-allowed', 'Already joined');
	}

	const players = Players.find({gameId: gameId});
	if (players.count() >= POSSIBLE_NO_PLAYERS) {
		throw new Meteor.Error('not-allowed', 'Maximum players reached');
	}

	const profile = Profiles.findOne({userId: user._id});
	let selectedShape = PLAYER_DEFAULT_SHAPE;
	if (profile && profile.lastShapeUsed) {
		selectedShape = profile.lastShapeUsed;
	}

	if (user._id !== game.hostId) {
		Games.update(
			{_id: gameId},
			{$set: {
				clientId: user._id,
				clientName: user.profile.name
			}}
		);
	}

	let shape = selectedShape;
	if (selectedShape === PLAYER_SHAPE_RANDOM) {
		shape = Random.choice(PLAYER_LIST_OF_SHAPES);
	}

	return Players.insert({
		userId: user._id,
		name: user.profile.name,
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
	if (notAskingForRematch.count() === 0) {
		const hostUser = Meteor.users.findOne({_id: game.createdBy});
		const clientPlayer = Players.findOne({gameId: gameId, userId: {$ne: game.createdBy}});
		const clientUser = Meteor.users.findOne({_id: clientPlayer.userId});

		const gameRematchId = createGame(clientUser, gameInitiators, game.tournamentId);

		Games.update(
			{_id: gameRematchId},
			{$set: {isPracticeGame: game.isPracticeGame, isPrivate: game.isPrivate}}
		);

		joinGame(clientUser, gameRematchId, true);
		joinGame(hostUser, gameRematchId, true);

		Games.update({_id: game._id}, {$set: {rematchGameId: gameRematchId}});

		Meteor.setTimeout(() => {
			startGame(gameRematchId, gameInitiators);
		}, 3000);
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
