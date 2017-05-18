import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import GameInitiator from '/imports/game/server/GameInitiator.js';
import {isGameStatusTimeout, isGameStatusFinished} from '/imports/game/utils.js';

/**
 * @param user
 * @param {GameInitiator[]} gameInitiators
 * @returns {string}
 */
export const createGame = function(user, gameInitiators) {
	let id = null;

	do {
		try {
			id = Games.insert({
				_id: Random.id(5),
				status: Constants.GAME_STATUS_REGISTRATION,
				createdAt: getUTCTimeStamp(),
				createdBy: user._id,
				creatorName: user.profile.name,
				isPracticeGame: 0,
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
export const joinGame = function(user, gameId, isReady) {
	const game = Games.findOne(gameId);

	if (!game) {
		throw new Meteor.Error(404, 'Game not found');
	}

	const player = Players.findOne({gameId: gameId, userId: user._id});
	if (player) {
		throw new Meteor.Error('not-allowed', 'Already joined');
	}

	const profile = Profiles.findOne({userId: user._id});
	let shape = Constants.PLAYER_DEFAULT_SHAPE;
	if (profile && profile.lastShapeUsed) {
		shape = profile.lastShapeUsed;
	}

	if (isReady === undefined) {
		isReady = false;
	}

	return Players.insert({
		userId: user._id,
		name: user.profile.name,
		gameId: gameId,
		joinedAt: getUTCTimeStamp(),
		isReady: isReady,
		askedForRematch: undefined,
		hasQuit: false,
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
		status: Constants.GAME_STATUS_STARTED,
		startedAt: getUTCTimeStamp(),
		lastPointAt: getUTCTimeStamp(),
		pointsDuration: []
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

	if (!isGameStatusTimeout(game.status) && !isGameStatusFinished(game.status)) {
		throw new Meteor.Error('not-allowed', 'Only timeout games and finished games can be rematched');
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

		const gameRematchId = createGame(clientUser, gameInitiators);

		Games.update(
			{_id: gameRematchId},
			{$set: {isPracticeGame: game.isPracticeGame, isPrivate: game.isPrivate, hasBonuses: game.hasBonuses}}
		);

		joinGame(clientUser, gameRematchId, true);
		joinGame(hostUser, gameRematchId, true);

		Games.update({_id: game._id}, {$set: {rematchGameId: gameRematchId}});

		Meteor.setTimeout(() => {
			startGame(gameRematchId, gameInitiators);
		}, 3000);
	}
};
