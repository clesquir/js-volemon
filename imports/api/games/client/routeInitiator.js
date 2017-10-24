import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import GameData from '/imports/api/games/client/GameData.js';
import GameInitiator from '/imports/api/games/client/GameInitiator.js';
import GameReaction from '/imports/api/games/client/GameReaction.js';
import GameRematch from '/imports/api/games/client/GameRematch.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import ClientStreamFactory from '/imports/lib/stream/client/ClientStreamFactory.js';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration.js';
import {updateConnectionIndicator, destroyConnectionIndicator} from '/imports/api/games/client/connectionIndicator.js';
import DefaultGameConfiguration from './DefaultGameConfiguration';

/** @type {Stream} */
export let stream = null;
/** @type {GameData} */
export let gameData = null;
/** @type {GameConfiguration} */
export let gameConfiguration = null;
/** @type {ServerNormalizedTime} */
export let serverNormalizedTime = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;

export const onRenderGameController = function() {
	initGame(Session.get('game'));

	$(window).bind('beforeunload', function() {
		quitGame(Session.get('game'));
		destroyGame(Session.get('game'));
	});

	updateConnectionIndicator();
};

export const onStopGameController = function() {
	quitGame(Session.get('game'));
	destroyGame(Session.get('game'));
	destroyConnectionIndicator();
	unsetGameSessions();
};

const initGame = function(gameId) {
	//Destroy if existent
	destroyGame(gameId);

	stream = ClientStreamFactory.fromConfiguration(StreamConfiguration.alias());
	stream.init();
	stream.connect(gameId);
	gameData = new GameData(gameId);
	gameData.init();
	gameConfiguration = new DefaultGameConfiguration(gameId);
	gameConfiguration.init();
	serverNormalizedTime = new ServerNormalizedTime();
	serverNormalizedTime.init();
	gameInitiator = new GameInitiator(gameId, stream, gameData, gameConfiguration, serverNormalizedTime);
	gameInitiator.init();
	gameRematch = new GameRematch(gameId, gameData);
	gameRematch.init();
	gameReaction = new GameReaction(gameId, stream, gameData, gameInitiator);
	gameReaction.init();
};

const quitGame = function(gameId) {
	if (gameId) {
		Meteor.call('quitGame', gameId);
	}
};

const destroyGame = function(gameId) {
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

const unsetGameSessions = function() {
	Session.set('game', undefined);
	Session.set('userCurrentlyPlaying', false);
};
