import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import GameData from '/imports/api/games/client/data/GameData.js';
import GameInitiator from '/imports/api/games/client/GameInitiator.js';
import GameReaction from '/imports/api/games/client/GameReaction.js';
import GameCheer from '/imports/api/games/client/GameCheer.js';
import GameRematch from '/imports/api/games/client/GameRematch.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import ClientStreamFactory from '/imports/lib/stream/client/ClientStreamFactory.js';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration.js';
import {updateConnectionIndicator, destroyConnectionIndicator} from '/imports/api/games/client/connectionIndicator.js';
import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration.js';
import MobileController from '/imports/api/games/client/deviceController/MobileController.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import GameNotifier from '/imports/api/games/client/GameNotifier.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import PluginFactory from '/imports/api/skins/plugins/PluginFactory.js';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';

/** @type {Stream} */
export let stream = null;
/** @type {GameData} */
export let gameData = null;
/** @type {ServerNormalizedTime} */
export let serverNormalizedTime = null;
/** @type {GameInitiator}|null */
let gameInitiator = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;
/** @type {GameCheer} */
export let gameCheer = null;

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
	const gameConfiguration = new DefaultGameConfiguration(gameId);
	gameConfiguration.init();
	const deviceController = new MobileController('.game-canvas-container', 'mobile-controller');
	deviceController.init();
	const engine = new PhaserEngine(gameConfiguration, deviceController);
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
	const gameSkin = new GameSkin(
		SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null),
		PluginFactory.fromConfiguration(userConfiguration)
	);
	gameSkin.init();
	serverNormalizedTime = new ServerNormalizedTime();
	serverNormalizedTime.init();
	gameInitiator = new GameInitiator(
		gameId,
		stream,
		gameData,
		gameConfiguration,
		gameSkin,
		engine,
		new GameNotifier(),
		serverNormalizedTime
	);
	gameInitiator.init();
	gameRematch = new GameRematch(gameId, gameData);
	gameRematch.init();
	gameReaction = new GameReaction(gameId, stream, gameData);
	gameReaction.init();
	gameCheer = new GameCheer(gameId, stream, gameInitiator);
	gameCheer.init();
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
			serverNormalizedTime = null;
		}
		if (gameInitiator) {
			gameInitiator.stop();
			gameInitiator = null;
		}
		if (gameRematch) {
			gameRematch.stop();
			gameRematch = null;
		}
		if (gameReaction) {
			gameReaction.stop();
			gameReaction = null;
		}
		if (gameCheer) {
			gameCheer.stop();
			gameCheer = null;
		}
		if (stream) {
			stream.disconnect(gameId);
			stream = null;
		}
	}
};

const unsetGameSessions = function() {
	Session.set('game', undefined);
	Session.set('userCurrentlyPlaying', false);
};
