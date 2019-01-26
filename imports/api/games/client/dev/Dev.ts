import SkinManager from "../components/SkinManager";
import {GameBoot} from "../GameBoot";
import DeviceController from "../../deviceController/DeviceController";
import GameConfiguration from "../../configuration/GameConfiguration";
import StreamBundler from "../streamBundler/StreamBundler";
import Ball from "../components/Ball";
import MainScene from "../scene/MainScene";
import Countdown from "../components/Countdown";
import StaticGameData from "../../data/StaticGameData";
import ServerNormalizedTime from "../ServerNormalizedTime";
import DesktopController from "../../deviceController/DesktopController";
import StaticGameConfiguration from "../../configuration/StaticGameConfiguration";
import NullStreamBundler from "../streamBundler/NullStreamBundler";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import NullServerAdapter from "../serverAdapter/NullServerAdapter";

export default class Dev {
	game: GameBoot;
	deviceController: DeviceController;
	gameData: StaticGameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;
	mainScene: MainScene | any;
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
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.serverNormalizedTime.init();
		this.serverAdapter = new NullServerAdapter();
	}

	start() {
		this.beforeStart();

		this.game = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.serverNormalizedTime,
			this.serverAdapter
		);
		this.game.init(
			{
				debug: false,
				type: this.renderer,
				postBoot: (game: Phaser.Game) => {
					this.mainScene = <any>game.scene.getScene('MainScene');

					this.overrideGame();
				}
			}
		);
	}

	stop() {
		this.game.stop();
	}

	beforeStart() {
	}

	overrideGame() {
		this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
		this.streamBundler.emitStream = () => {};
		this.mainScene.bonuses.createBonusIfTimeHasElapsed = () => {};
		this.mainScene.createComponents = () => {this.createComponents();};
		this.mainScene.resumeOnTimerEnd = () => {this.resumeOnTimerEnd();};
		this.initialUpdate = this.mainScene.update;
		this.mainScene.update = () => {this.updateGame();};
		this.mainScene.onBallHitGround = (ball: Ball) => {
			this.onBallHitGround(ball);
		};
	}

	createComponents() {
		this.mainScene.level.createCollisionCategories();

		this.mainScene.artificialIntelligence.initFromData(this.gameData);
		this.createPlayersComponents();
		this.mainScene.ball = this.mainScene.createBall();

		this.createLevelComponents();

		this.mainScene.countdown = new Countdown(
			this.mainScene,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime
		);
	}

	createPlayersComponents() {
		this.mainScene.players.create();
	}

	createLevelComponents() {
		this.mainScene.level.createGround();
		this.mainScene.level.createNet();
		this.mainScene.level.createFieldLimits(true);
	}

	onBallHitGround(ball: Ball) {
		if (this.mainScene.gameResumed === true) {
			this.mainScene.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
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
		this.mainScene.ball.reset(this.gameData.lastPointTaken);
	}

	updateGame() {
		this.initialUpdate.call(this.mainScene);
	}

	cheerPlayer(forHost) {
		this.mainScene.cheer(forHost);
	}
}
