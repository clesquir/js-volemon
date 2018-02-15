import {destroyConnectionIndicator, updateConnectionIndicator} from '/imports/api/games/client/connectionIndicator.js';
import GameCheer from '/imports/api/games/client/GameCheer.js';
import GameInitiator from '/imports/api/games/client/GameInitiator.js';
import GameNotifier from '/imports/api/games/client/GameNotifier.js';
import GameReaction from '/imports/api/games/client/GameReaction.js';
import GameRematch from '/imports/api/games/client/GameRematch.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration.js';
import CollectionGameData from '/imports/api/games/data/CollectionGameData.js';
import GameData from '/imports/api/games/data/GameData.js';
import DesktopController from '/imports/api/games/deviceController/DesktopController.js';
import MobileController from '/imports/api/games/deviceController/MobileController.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import PluginFactory from '/imports/api/skins/plugins/PluginFactory.js';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations.js';
import {UserReactions} from '/imports/api/users/userReactions.js';
import {CustomReactions} from '/imports/lib/reactions/CustomReactions.js';
import {UserKeymaps} from '/imports/api/users/userKeymaps.js';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps.js';
import ClientStreamFactory from '/imports/lib/stream/client/ClientStreamFactory.js';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration.js';
import {onMobileAndTablet} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

/** @type {Stream} */
export let stream = null;
/** @type {GameData} */
export let gameData = null;
/** @type {ServerNormalizedTime} */
export let serverNormalizedTime = null;
/** @type {DeviceController} */
let deviceController = null;
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
	Session.set('gameLoadingMask');
};

const initGame = function(gameId) {
	//Destroy if existent
	destroyGame(gameId);

	stream = ClientStreamFactory.fromConfiguration(StreamConfiguration.alias());
	stream.init();
	stream.connect(gameId);
	gameData = new CollectionGameData(gameId, Meteor.userId());
	gameData.init();
	const gameConfiguration = new DefaultGameConfiguration(gameId);

	if (onMobileAndTablet()) {
		deviceController = new MobileController('.game-canvas-container', 'mobile-controller');
	} else {
		const userKeymaps = UserKeymaps.findOne({userId: Meteor.userId()});
		deviceController = new DesktopController(CustomKeymaps.fromUserKeymaps(userKeymaps));
	}
	deviceController.init();

	const engine = new PhaserEngine();
	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
	const userReactions = UserReactions.findOne({userId: Meteor.userId()});
	const gameSkin = new GameSkin(
		SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null),
		PluginFactory.fromConfiguration(userConfiguration)
	);
	gameSkin.init();
	serverNormalizedTime = new ServerNormalizedTime();
	serverNormalizedTime.init();

	gameInitiator = new GameInitiator(
		gameId,
		deviceController,
		engine,
		gameData,
		gameConfiguration,
		gameSkin,
		stream,
		serverNormalizedTime,
		new GameNotifier()
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
		if (deviceController) {
			deviceController.stop();
			deviceController = null;
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
	Session.set('game', null);
	Session.set('userCurrentlyPlaying', false);
};
