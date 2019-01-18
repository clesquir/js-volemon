import NullStreamBundler from 'imports/api/games/client/streamBundler/NullStreamBundler';
import ServerNormalizedTime from 'imports/api/games/client/ServerNormalizedTime';
import StaticGameConfiguration from 'imports/api/games/configuration/StaticGameConfiguration';
import StaticGameData from 'imports/api/games/data/StaticGameData';
import DesktopController from 'imports/api/games/deviceController/DesktopController';
import {PLAYER_DEFAULT_SHAPE} from 'imports/api/games/shapeConstants';
import {Random} from 'meteor/random';
import SkinManager from "../skin/SkinManager";
import {GameBoot} from "../GameBoot";
import DeviceController from "../../deviceController/DeviceController";
import GameConfiguration from "../../configuration/GameConfiguration";
import StreamBundler from "../streamBundler/StreamBundler";
import Ball from "../components/Ball";
import MainScene from "../scene/MainScene";
import Countdown from "../components/Countdown";

export default class Dev {
	game: GameBoot;
	deviceController: DeviceController;
	gameData: StaticGameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
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
	}

	start() {
		this.beforeStart();

		this.game = new GameBoot(
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.serverNormalizedTime
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
		//@todo Bonus
		// this.gameBonus.createBonusIfTimeHasElapsed = () => {};

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
		this.mainScene.players.create();
		this.mainScene.ball = this.mainScene.createBall();

		this.createLevelComponents();

		this.mainScene.countdown = new Countdown(
			this.gameData,
			this.serverNormalizedTime
		);
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
			this.resumeOnTimerEnd();
		}
	}

	resumeOnTimerEnd() {
		this.mainScene.pauseGame();
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
