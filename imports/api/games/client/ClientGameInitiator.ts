import GameNotifier from './GameNotifier';
import GameStreamInitiator from './GameStreamInitiator';
import {Players} from '../players';
import DeviceController from "../deviceController/DeviceController";
import GameConfiguration from "../configuration/GameConfiguration";
import GameData from "../data/GameData";
import SkinManager from "./component/SkinManager";
import StreamBundler from "./streamBundler/StreamBundler";
import Stream from "../../../lib/stream/Stream";
import {GameBoot} from "./boot/GameBoot";
import MeteorServerAdapter from "./serverAdapter/MeteorServerAdapter";
import MainScene from "./scene/MainScene";
import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {EventPublisher} from "../../../lib/EventPublisher";
import PointTaken from "../events/PointTaken";
import GameStatusChanged from "../events/GameStatusChanged";
import NormalizedTime from "../../../lib/normalizedTime/NormalizedTime";
import GameReplayStarted from "../events/GameReplayStarted";

export default class ClientGameInitiator {
	gameId: string;
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	normalizedTime: NormalizedTime;
	stream: Stream;
	gameNotifier: GameNotifier;

	private gameStreamInitiator: GameStreamInitiator;
	private gameCreated: boolean = false;
	private gameBoot: GameBoot;
	mainScene: MainScene = null;

	constructor(
		gameId: string,
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		normalizedTime: NormalizedTime,
		stream: Stream,
		gameNotifier: GameNotifier
	) {
		this.gameId = gameId;
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.normalizedTime = normalizedTime;
		this.stream = stream;
		this.gameNotifier = gameNotifier;

		this.gameStreamInitiator = new GameStreamInitiator(this, this.stream);
	}

	init() {
		this.gameStreamInitiator.init();

		if (this.gameData.isGameStatusOnGoing()) {
			this.createNewGameWhenReady();
		}

		EventPublisher.on(GameReplayStarted.prototype.constructor.name, this.onGameReplayStarted, this);
		EventPublisher.on(GameStatusChanged.prototype.constructor.name, this.onGameStatusChanged, this);
		EventPublisher.on(PointTaken.prototype.constructor.name, this.onPointTaken, this);
	}

	stop() {
		EventPublisher.off(PointTaken.prototype.constructor.name, this.onPointTaken, this);
		EventPublisher.off(GameStatusChanged.prototype.constructor.name, this.onGameStatusChanged, this);
		EventPublisher.off(GameReplayStarted.prototype.constructor.name, this.onGameReplayStarted, this);

		if (this.hasActiveGame()) {
			this.gameBoot.stop();
			this.mainScene = null;
		}

		this.gameStreamInitiator.stop();
	}

	createNewGameWhenReady() {
		const me = this;

		//Wait for gameContainer creation before starting game
		let loopUntilGameContainerIsCreated = () => {
			if (document.getElementById('game-container')) {
				if (this.gameCreated === false) {
					this.gameCreated = true;
					me.createNewGame();
				}
			} else {
				window.setTimeout(loopUntilGameContainerIsCreated, 1);
			}
		};

		loopUntilGameContainerIsCreated();
	}

	hasActiveGame() {
		return this.mainScene !== null;
	}

	private createNewGame() {
		this.gameData.init();

		this.gameBoot = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.normalizedTime,
			new MeteorServerAdapter()
		);
		this.gameBoot.start(
			{
				postBoot: () => {
					this.mainScene = this.gameBoot.mainScene;
				}
			}
		);

		let player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
		if (!player) {
			Meteor.call('addGameViewer', this.gameId, Meteor.userId());
		}
	}

	private onGameReplayStarted() {
		if (this.hasActiveGame()) {
			this.mainScene.onGameReplayStarted();
		}
	}

	private onGameStatusChanged() {
		if (this.gameData.isGameStatusStarted()) {
			this.gameNotifier.onGameStart();
			Session.set('appLoadingMask', false);
			Session.set('appLoadingMask.text', undefined);
		}
	}

	private onPointTaken() {
		if (this.hasActiveGame()) {
			this.mainScene.onPointTaken();
		}
	}
}
