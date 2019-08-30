import ClientGameInitiator from "./ClientGameInitiator";
import SkinManager from "./component/SkinManager";
import {destroyConnectionIndicator, updateConnectionIndicator} from "./connectionIndicator";
import GameCheer from "./GameCheer";
import CollectionObserverGameDataUpdater from "./gameDataUpdater/CollectionObserverGameDataUpdater";
import GameNotifier from "./GameNotifier";
import GameReaction from "./GameReaction";
import GameRematch from "./GameRematch";
import GameTimer from "./GameTimer";
import GameStreamBundler from "./streamBundler/GameStreamBundler";
import NullStreamBundler from "./streamBundler/NullStreamBundler";
import StreamBundler from "./streamBundler/StreamBundler";
import DefaultGameConfiguration from "../configuration/DefaultGameConfiguration";
import CollectionGameData from "../data/CollectionGameData";
import GameData from "../data/GameData";
import DesktopController from "../deviceController/DesktopController";
import DeviceController from "../deviceController/DeviceController";
import MobileController from "../deviceController/MobileController";
import GameDataUpdater from "./gameDataUpdater/GameDataUpdater";
import PluginFactory from "../../skins/plugins/PluginFactory";
import SkinFactory from "../../skins/skins/SkinFactory";
import {UserConfigurations} from "../../users/userConfigurations";
import {UserKeymaps} from "../../users/userKeymaps";
import {EventPublisher} from "../../../lib/EventPublisher";
import PageUnload from "../../../lib/events/PageUnload";
import CustomKeymaps from "../../../lib/keymaps/CustomKeymaps";
import ClientServerOffsetNormalizedTime from "../../../lib/normalizedTime/ClientServerOffsetNormalizedTime";
import NormalizedTime from "../../../lib/normalizedTime/NormalizedTime";
import ClientStreamFactory from "../../../lib/stream/client/ClientStreamFactory";
import StreamConfiguration from "../../../lib/stream/StreamConfiguration";
import Stream from "../../../lib/stream/Stream";
import {onMobileAndTablet} from "../../../lib/utils";
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import CurrentGame from "../CurrentGame";
import {Games} from "../games";

export default class RouteInitiator {
	private static instance: RouteInitiator;
	private deviceController: DeviceController;
	private gameData: GameData;
	private gameDataUpdater: GameDataUpdater;
	private normalizedTime: NormalizedTime;
	private stream: Stream;
	private streamBundler: StreamBundler;
	private gameInitiator: ClientGameInitiator;
	private gameTimer: GameTimer;
	private gameRematch: GameRematch;
	private gameReaction: GameReaction;
	private gameCheer: GameCheer;

	static get(): RouteInitiator {
		if (!this.instance) {
			this.instance = new RouteInitiator();
		}

		return this.instance;
	}

	onControllerRender(gameId: string) {
		this.initGame(gameId);
		updateConnectionIndicator(this.stream);

		EventPublisher.on(
			PageUnload.prototype.constructor.name,
			this.unbindOnPageLeft,
			this
		);

		window.onbeforeunload = (e) => {
			this.beforeActiveGameUnload(e);
		};
	}

	onControllerStop(controller) {
		if (this.isLeavingUserGame()) {
			if (!confirm(`Are you sure you want to leave the game?`)) {
				controller.redirect(controller.url);
				return;
			}
		}

		this.unbindOnPageLeft();
		destroyConnectionIndicator();
		this.unsetGameSessions();
		Session.set('gameLoadingMask', null);

		window.onbeforeunload = undefined;

		EventPublisher.off(
			PageUnload.prototype.constructor.name,
			this.unbindOnPageLeft,
			this
		);
	}

	toggleReactionSelector() {
		this.gameReaction.toggleSelectorDisplay();
	}

	onReactionSelection(reactionButton: JQuery<HTMLElement>) {
		this.gameReaction.onReactionSelection(reactionButton);
	}

	cheerPlayer(forHost: boolean) {
		this.gameCheer.cheerPlayer(forHost);
	}

	private isLeavingUserGame() {
		return this.gameData && this.gameData.isGameStatusStarted() && this.gameData.isUserPlayer();
	}

	private beforeActiveGameUnload(e) {
		if (this.isLeavingUserGame()) {
			e.returnValue = `Are you sure you want to leave the game?`;

			return e.returnValue;
		}
	}

	private unbindOnPageLeft() {
		this.quitGame(Session.get('game'));
		this.destroyGame(Session.get('game'));
	}

	private initGame(gameId) {
		//Destroy if existent
		this.destroyGame(gameId);

		CurrentGame.set(Games.findOne({_id: gameId}));

		this.normalizedTime = ClientServerOffsetNormalizedTime.get();
		this.normalizedTime.init();

		this.stream = ClientStreamFactory.fromConfiguration(StreamConfiguration.alias());
		this.stream.init();
		this.stream.connect(gameId);

		this.gameData = new CollectionGameData(gameId, this.normalizedTime, Meteor.userId());
		this.gameData.init();

		const gameConfiguration = new DefaultGameConfiguration(gameId);

		this.streamBundler = new GameStreamBundler(this.stream);
		if (this.gameData.isTournamentPractice()) {
			this.streamBundler = new NullStreamBundler();
		}

		if (onMobileAndTablet()) {
			this.deviceController = new MobileController('.game-canvas-container', 'mobile-controller');
		} else {
			const userKeymaps = UserKeymaps.findOne({userId: Meteor.userId()});
			this.deviceController = new DesktopController(CustomKeymaps.fromUserKeymaps(userKeymaps));
		}
		this.deviceController.init();

		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		const skinManager = new SkinManager(
			gameConfiguration,
			SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null),
			PluginFactory.fromConfiguration(userConfiguration)
		);
		skinManager.init();

		this.gameInitiator = new ClientGameInitiator(
			gameId,
			this.deviceController,
			this.gameData,
			gameConfiguration,
			skinManager,
			this.streamBundler,
			this.normalizedTime,
			this.stream,
			new GameNotifier()
		);
		this.gameInitiator.init();

		this.gameDataUpdater = new CollectionObserverGameDataUpdater(this.gameData);
		this.gameDataUpdater.init();

		this.gameTimer = new GameTimer(this.gameData);
		this.gameTimer.init();

		this.gameRematch = new GameRematch(gameId, this.gameData);
		this.gameRematch.init();

		this.gameReaction = new GameReaction(gameId, this.stream, this.gameData);
		this.gameReaction.init();

		this.gameCheer = new GameCheer(gameId, this.stream, this.gameInitiator);
		this.gameCheer.init();
	}

	private quitGame(gameId) {
		if (gameId) {
			Meteor.call('removeGameViewer', gameId, Meteor.userId());
			Meteor.call('quitGame', gameId, Meteor.userId());
		}
	};

	private destroyGame(gameId) {
		if (gameId) {
			this.stopService(this.normalizedTime);
			this.stopService(this.gameInitiator);
			this.stopService(this.gameDataUpdater);
			this.stopService(this.gameTimer);
			this.stopService(this.gameRematch);
			this.stopService(this.deviceController);
			this.stopService(this.gameReaction);
			this.stopService(this.gameCheer);
			if (this.stream) {
				this.stream.disconnect(gameId);
				this.stream = null;
			}
		}
	}

	private stopService(service) {
		if (service) {
			service.stop();
			service = null;
		}
	}

	private unsetGameSessions() {
		Session.set('game', null);
		Session.set('userCurrentlyPlaying', false);
	}
}
