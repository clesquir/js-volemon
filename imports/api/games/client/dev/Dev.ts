import SkinManager from "../component/SkinManager";
import {GameBoot} from "../boot/GameBoot";
import DeviceController from "../../deviceController/DeviceController";
import GameConfiguration from "../../configuration/GameConfiguration";
import StreamBundler from "../streamBundler/StreamBundler";
import Ball from "../component/Ball";
import MainScene from "../scene/MainScene";
import Countdown from "../component/Countdown";
import StaticGameData from "../../data/StaticGameData";
import DesktopController from "../../deviceController/DesktopController";
import StaticGameConfiguration from "../../configuration/StaticGameConfiguration";
import NullStreamBundler from "../streamBundler/NullStreamBundler";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import NullServerAdapter from "../serverAdapter/NullServerAdapter";
import NormalizedTime from "../../../../lib/normalizedTime/NormalizedTime";
import ClientServerOffsetNormalizedTime from "../../../../lib/normalizedTime/ClientServerOffsetNormalizedTime";

export default class Dev {
	gameBoot: GameBoot;
	deviceController: DeviceController;
	gameData: StaticGameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	normalizedTime: NormalizedTime;
	serverAdapter: ServerAdapter;
	mainScene: MainScene | any;
	debug: boolean = true;
	renderer: number;
	initialUpdate: () => void;

	constructor() {
		this.deviceController = DesktopController.fromDefaults();
		this.deviceController.init();
		this.gameData = new StaticGameData();
		this.gameData.init();
		this.gameConfiguration = new StaticGameConfiguration();
		this.skinManager = SkinManager.withDefaults(this.gameConfiguration);
		this.skinManager.init();
		this.streamBundler = new NullStreamBundler();
		this.normalizedTime = new ClientServerOffsetNormalizedTime();
		this.normalizedTime.init();
		this.serverAdapter = new NullServerAdapter();
	}

	start() {
		this.beforeStart();

		this.gameBoot = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.normalizedTime,
			this.serverAdapter
		);
		this.gameBoot.start(
			{
				debug: this.debug,
				renderer: this.renderer,
				postBoot: () => {
					this.mainScene = this.gameBoot.mainScene;

					this.overrideGame();
				}
			}
		);
	}

	stop() {
		if (this.gameBoot) {
			this.gameBoot.stop();
		}
	}

	beforeStart() {
	}

	overrideGame() {
		this.gameData.lastPointAt = this.normalizedTime.getTime();
		this.streamBundler.emitStream = () => {};
		this.mainScene.bonuses.createBonusIfTimeHasElapsed = () => {};
		this.mainScene.createComponents = () => {this.createComponents();};
		this.mainScene.resumeOnTimerEnd = () => {this.resumeOnTimerEnd();};
		this.initialUpdate = this.mainScene.update;
		this.mainScene.update = () => {this.updateGame();};
		this.mainScene.onBallHitScoreZone = (ball: Ball) => {
			this.onBallHitScoreZone(ball);
		};
	}

	createComponents() {
		this.mainScene.level.createComponentsPrerequisites();

		this.mainScene.zIndexGroup = this.mainScene.game.add.group();
		this.createLevelComponents();

		this.mainScene.artificialIntelligence.initFromData(this.mainScene, this.gameData, this.gameConfiguration);
		this.createPlayersComponents();
		this.mainScene.balls.create();

		this.mainScene.countdown = new Countdown(
			this.mainScene,
			this.gameData,
			this.gameConfiguration,
			this.normalizedTime
		);
	}

	createPlayersComponents() {
		this.mainScene.players.create();
	}

	createLevelComponents() {
		this.mainScene.level.createGround();
		this.mainScene.level.createNet();
		this.mainScene.level.createSoccerNet();
		this.mainScene.level.createFieldLimits(true);
	}

	onBallHitScoreZone(ball: Ball) {
		if (this.mainScene.gameResumed === true) {
			this.mainScene.showBallHitPoint(
				ball.x(),
				ball.y(),
				ball.diameter()
			);

			this.mainScene.gameResumed = false;

			this.gameData.lastPointAt = this.normalizedTime.getTime();
			this.mainScene.level.shakeGround();
			this.resumeOnTimerEnd();
		}
	}

	resumeOnTimerEnd() {
		this.mainScene.pauseGame();
		this.mainScene.bonuses.reset();
		this.resetPlayersAndBall();
		this.mainScene.startCountdownTimer();
	}

	resetPlayersAndBall() {
		this.mainScene.players.reset();
		this.mainScene.balls.reset(this.gameData.lastPointTaken);
	}

	updateGame() {
		this.initialUpdate.call(this.mainScene);
	}

	cheerPlayer(forHost) {
		this.mainScene.cheer(forHost);
	}
}
