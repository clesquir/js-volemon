import {Session} from 'meteor/session';
import DefaultGameConfiguration from "../configuration/DefaultGameConfiguration";
import NullStreamBundler from "../client/streamBundler/NullStreamBundler";
import {UserConfigurations} from "../../users/userConfigurations";
import SkinManager from "../client/component/SkinManager";
import SkinFactory from "../../skins/skins/SkinFactory";
import PluginFactory from "../../skins/plugins/PluginFactory";
import ClientGameInitiator from "../client/ClientGameInitiator";
import GameNotifier from "../client/GameNotifier";
import GameTimer from "../client/GameTimer";
import NullDeviceController from "../deviceController/NullDeviceController";
import GameData from "../data/GameData";
import GameDataUpdater from "../client/gameDataUpdater/GameDataUpdater";
import NormalizedTime from "../../../lib/normalizedTime/NormalizedTime";
import ReplayReader from "./ReplayReader";
import ReplayNormalizedTime from "../../../lib/normalizedTime/ReplayNormalizedTime";
import ReplayStream from "../../../lib/stream/client/ReplayStream";
import Stream from "../../../lib/stream/Stream";
import CollectionGameData from "../data/CollectionGameData";
import CurrentGame from "../CurrentGame";
import {Games} from "../games";
import GameReaction from "../client/GameReaction";
import GameCheer from "../client/GameCheer";

export default class ReplayRouteInitiator {
	private static instance: ReplayRouteInitiator;
	private replayReader: ReplayReader;
	private gameData: GameData;
	private gameDataUpdater: GameDataUpdater;
	private normalizedTime: NormalizedTime;
	private stream: Stream;
	private gameInitiator: ClientGameInitiator;
	private gameTimer: GameTimer;
	private gameReaction: GameReaction;
	private gameCheer: GameCheer;

	static get(): ReplayRouteInitiator {
		if (!this.instance) {
			this.instance = new ReplayRouteInitiator();
		}

		return this.instance;
	}

	onControllerRender(gameId: string) {
		this.initGame(gameId);
	}

	onControllerStop() {
		this.destroyGame(Session.get('game'));
		this.unsetGameSessions();
		Session.set('gameLoadingMask', null);
	}

	restartReplay() {
		this.replayReader.restart();
	}

	private initGame(gameId: string) {
		//Destroy if existent
		this.destroyGame(gameId);

		CurrentGame.set(Games.findOne({_id: gameId}), true);

		this.replayReader = new ReplayReader(gameId);

		this.normalizedTime = new ReplayNormalizedTime(this.replayReader);
		this.normalizedTime.init();

		this.stream = new ReplayStream();
		this.stream.init();

		this.gameData = new CollectionGameData(gameId, this.normalizedTime, null);
		this.gameData.init();

		this.replayReader.inject(this.stream, this.gameData);
		this.replayReader.init();

		const gameConfiguration = new DefaultGameConfiguration(gameId);

		const userConfiguration = UserConfigurations.findOne({userId: Meteor.userId()});
		const skinManager = new SkinManager(
			gameConfiguration,
			SkinFactory.fromId(userConfiguration ? userConfiguration.skinId : null),
			PluginFactory.fromConfiguration(userConfiguration)
		);
		skinManager.init();

		this.gameInitiator = new ClientGameInitiator(
			gameId,
			new NullDeviceController(),
			this.gameData,
			gameConfiguration,
			skinManager,
			new NullStreamBundler(),
			this.normalizedTime,
			this.stream,
			new GameNotifier()
		);
		this.gameInitiator.init();

		this.gameTimer = new GameTimer(this.gameData);
		this.gameTimer.init();

		this.gameReaction = new GameReaction(gameId, this.stream, this.gameData);
		this.gameReaction.init();

		this.gameCheer = new GameCheer(gameId, this.stream, this.gameInitiator);
		this.gameCheer.init();
	}

	private destroyGame(gameId) {
		if (gameId) {
			this.destroyService(this.replayReader);
			this.stopService(this.gameInitiator);
			this.stopService(this.gameDataUpdater);
			this.stopService(this.gameTimer);
			this.stopService(this.gameReaction);
			this.stopService(this.gameCheer);
		}
	}

	private destroyService(service) {
		if (service) {
			service.destroy();
			service = null;
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
	}
}
