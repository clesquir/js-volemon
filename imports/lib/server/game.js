import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {Profiles} from '/collections/profiles.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import StreamInitiator from '/imports/game/server/StreamInitiator.js';
import {ServerStreamInitiator} from '/imports/lib/stream/server/ServerStreamInitiator.js';
import {isGameStatusTimeout, isGameStatusFinished} from '/imports/game/utils.js';

/**
 * @param user
 * @param {StreamInitiator[]} streamInitiators
 * @returns {string}
 */
export const createGame = function(user, streamInitiators) {
	let id = null;

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
	} while (id === null);

	streamInitiators[id] = new StreamInitiator(id, ServerStreamInitiator);
	streamInitiators[id].init();

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
 * @param {StreamInitiator[]} streamInitiators
 */
export const startGame = function(gameId, streamInitiators) {
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

	if (streamInitiators[gameId]) {
		streamInitiators[gameId].start();
	}
};

/**
 * @param {string} userId
 * @param {string} gameId
 * @param {boolean} accepted
 * @param {StreamInitiator[]} streamInitiators
 */
export const replyRematch = function(userId, gameId, accepted, streamInitiators) {
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

		const gameRematchId = createGame(clientUser, streamInitiators);
		joinGame(clientUser, gameRematchId, true);
		joinGame(hostUser, gameRematchId, true);

		Games.update({_id: game._id}, {$set: {rematchGameId: gameRematchId}});

		Meteor.setTimeout(() => {
			startGame(gameRematchId, streamInitiators);
		}, 1500);
	}
};
