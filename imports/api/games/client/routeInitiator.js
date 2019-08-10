import ClientGameInitiator from '/imports/api/games/client/ClientGameInitiator';
import SkinManager from '/imports/api/games/client/component/SkinManager';
import {destroyConnectionIndicator, updateConnectionIndicator} from '/imports/api/games/client/connectionIndicator';
import GameCheer from '/imports/api/games/client/GameCheer';
import CollectionObserverGameDataUpdater from '/imports/api/games/client/gameDataUpdater/CollectionObserverGameDataUpdater';
import GameNotifier from '/imports/api/games/client/GameNotifier';
import GameReaction from '/imports/api/games/client/GameReaction';
import GameRematch from '/imports/api/games/client/GameRematch';
import GameTimer from '/imports/api/games/client/GameTimer';
import GameStreamBundler from '/imports/api/games/client/streamBundler/GameStreamBundler';
import NullStreamBundler from '/imports/api/games/client/streamBundler/NullStreamBundler';
import DefaultGameConfiguration from '/imports/api/games/configuration/DefaultGameConfiguration';
import CollectionGameData from '/imports/api/games/data/CollectionGameData';
import GameData from '/imports/api/games/data/GameData';
import DesktopController from '/imports/api/games/deviceController/DesktopController';
import MobileController from '/imports/api/games/deviceController/MobileController';
import PluginFactory from '/imports/api/skins/plugins/PluginFactory';
import SkinFactory from '/imports/api/skins/skins/SkinFactory';
import {UserConfigurations} from '/imports/api/users/userConfigurations';
import {UserKeymaps} from '/imports/api/users/userKeymaps';
import {EventPublisher} from '/imports/lib/EventPublisher';
import PageUnload from '/imports/lib/events/PageUnload';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps';
import ClientServerOffsetNormalizedTime from '/imports/lib/normalizedTime/ClientServerOffsetNormalizedTime';
import NormalizedTime from '/imports/lib/normalizedTime/NormalizedTime';
import ClientStreamFactory from '/imports/lib/stream/client/ClientStreamFactory';
import StreamConfiguration from '/imports/lib/stream/StreamConfiguration';
import {onMobileAndTablet} from '/imports/lib/utils';
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

/** @type {DeviceController} */
let deviceController = null;
/** @type {GameData} */
export let gameData = null;
/** @type {NormalizedTime} */
export let normalizedTime = null;
/** @type {Stream} */
let stream = null;
/** @type {ClientGameInitiator}|null */
let gameInitiator = null;
/** @type {GameDataUpdater}|null */
let gameDataUpdater = null;
/** @type {GameTimer}|null */
let gameTimer = null;
/** @type {GameRematch}|null */
let gameRematch = null;
/** @type {GameReaction} */
export let gameReaction = null;
/** @type {GameCheer} */
export let gameCheer = null;

export const onRenderGameController = function() {
	initGame(Session.get('game'));
	updateConnectionIndicator(stream);

	EventPublisher.on(
		PageUnload.prototype.constructor.name,
		unbindOnPageLeft,
		null
	);

	window.onbeforeunload = beforeActiveGameUnload;
};

export const onStopGameController = function() {
	if (isLeavingUserGame()) {
		if (!confirm(`Are you sure you want to leave the game?`)) {
			this.redirect(this.url);
			return;
		}
	}

	unbindOnPageLeft();
	destroyConnectionIndicator();
	unsetGameSessions();
	Session.set('gameLoadingMask');

	window.onbeforeunload = undefined;

	EventPublisher.off(
		PageUnload.prototype.constructor.name,
		unbindOnPageLeft,
		null
	);
};

const isLeavingUserGame = function() {
	return gameData && gameData.isGameStatusStarted() && gameData.isUserPlayer();
};

const beforeActiveGameUnload = function(e) {
	if (isLeavingUserGame()) {
		e.returnValue = `Are you sure you want to leave the game?`;

		return e.returnValue;
	}
};

const unbindOnPageLeft = function() {
	quitGame(Session.get('game'));
	destroyGame(Session.get('game'));
};

const initGame = function(gameId) {
	//Destroy if existent
	destroyGame(gameId);

	normalizedTime = new ClientServerOffsetNormalizedTime();
	normalizedTime.init();

	stream = ClientStreamFactory.fromConfiguration(StreamConfiguration.alias());
	stream.init();
	stream.connect(gameId);

	gameData = new CollectionGameData(gameId, normalizedTime, Meteor.userId());
	gameData.init();

	const gameConfiguration = new DefaultGameConfiguration(gameId);

	let streamBundler = new GameStreamBundler(stream);
	if (gameData.isTournamentPractice()) {
		streamBundler = new NullStreamBundler();
	}

	if (onMobileAndTablet()) {
		deviceController = new MobileController('.game-canvas-container', 'mobile-controller');
	} else {
		const userKeymaps = UserKeymaps.findOne({userId: Meteor.userId()});
		deviceController = new DesktopController(CustomKeymaps.fromUserKeymaps(userKeymaps));
	}
	deviceController.init();

	const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
	const skinManager = new SkinManager(
		gameConfiguration,
		SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null),
		PluginFactory.fromConfiguration(userConfiguration)
	);
	skinManager.init();

	gameInitiator = new ClientGameInitiator(
		gameId,
		deviceController,
		gameData,
		gameConfiguration,
		skinManager,
		streamBundler,
		normalizedTime,
		stream,
		new GameNotifier()
	);
	gameInitiator.init();

	gameDataUpdater = new CollectionObserverGameDataUpdater(gameData);
	gameDataUpdater.init();

	gameTimer = new GameTimer(gameData);
	gameTimer.init();

	gameRematch = new GameRematch(gameId, gameData);
	gameRematch.init();

	gameReaction = new GameReaction(gameId, stream, gameData);
	gameReaction.init();

	gameCheer = new GameCheer(gameId, stream, gameInitiator);
	gameCheer.init();
};

const quitGame = function(gameId) {
	if (gameId) {
		Meteor.call('removeGameViewer', gameId, Meteor.userId());
		Meteor.call('quitGame', gameId, Meteor.userId());
	}
};

const destroyGame = function(gameId) {
	if (gameId) {
		if (normalizedTime) {
			normalizedTime.stop();
			normalizedTime = null;
		}
		if (gameInitiator) {
			gameInitiator.stop();
			gameInitiator = null;
		}
		if (gameDataUpdater) {
			gameDataUpdater.stop();
			gameDataUpdater = null;
		}
		if (gameTimer) {
			gameTimer.stop();
			gameTimer = null;
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
