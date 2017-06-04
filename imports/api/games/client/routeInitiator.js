import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import GameData from '/imports/api/games/client/GameData.js';
import GameInitiator from '/imports/api/games/client/GameInitiator.js';
import GameReaction from '/imports/api/games/client/GameReaction.js';
import GameRematch from '/imports/api/games/client/GameRematch.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

/** @type {Stream} */
export let stream = null;
/** @type {GameData} */
let gameData = null;
/** @type {ServerNormalizedTime} */
export let serverNormalizedTime = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;

export const initGame = function(gameId) {
	//Destroy if existent
	destroyGame(gameId);

	stream = new ClientSocketIo();
	stream.init();
	stream.connect(gameId);
	gameData = new GameData(gameId);
	gameData.init();
	serverNormalizedTime = new ServerNormalizedTime();
	serverNormalizedTime.init();
	gameInitiator = new GameInitiator(gameId, stream, gameData, serverNormalizedTime);
	gameInitiator.init();
	gameRematch = new GameRematch(gameId, gameData);
	gameRematch.init();
	gameReaction = new GameReaction(gameId, stream, gameData, gameInitiator);
	gameReaction.init();
};

export const quitGame = function(gameId) {
	if (gameId) {
		Meteor.call('quitGame', gameId);
	}
};

export const destroyGame = function(gameId) {
	if (gameId) {
		if (serverNormalizedTime) {
			serverNormalizedTime.stop();
		}
		if (gameInitiator) {
			gameInitiator.stop();
		}
		if (gameRematch) {
			gameRematch.stop();
		}
		if (gameReaction) {
			gameReaction.stop();
		}
		if (stream) {
			stream.disconnect(gameId);
		}
	}
};

export const unsetGameSessions = function() {
	Session.set('game', undefined);
	Session.set('userCurrentlyPlaying', false);
};
