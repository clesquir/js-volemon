import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../component/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import Level from "../component/Level";
import Ball from "../component/Ball";
import ArtificialIntelligence from "../../artificialIntelligence/ArtificialIntelligence";
import {CLIENT_POINTS_COLUMN, DEPTH_ACTIVATION_ANIMATION, HOST_POINTS_COLUMN} from "../../constants";
import {PositionData} from "../component/PositionData";
import Countdown from "../component/Countdown";
import Animations from "../component/Animations";
import Players from "../component/Players";
import Bonuses from "../component/Bonuses";
import {BonusStreamData} from "../../bonus/data/BonusStreamData";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import {BonusPositionData} from "../../bonus/data/BonusPositionData";
import ScaleManager from "../component/ScaleManager";
import Player from "../component/Player";
import Bonus from "../component/Bonus";
import Balls from "../component/Balls";
import NormalizedTime from "../../../../lib/normalizedTime/NormalizedTime";

export default class MainScene {
	game: Phaser.Game;
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	normalizedTime: NormalizedTime;
	serverAdapter: ServerAdapter;

	animations: Animations;
	level: Level;
	artificialIntelligence: ArtificialIntelligence;
	players: Players;
	balls: Balls;
	bonuses: Bonuses;
	scaleManager: ScaleManager;

	zIndexGroup: Phaser.Group;
	countdown: Countdown;

	gameInitiated: boolean = false;
	gameResumed: boolean = false;
	gameHasEnded: boolean = false;

	lastPointAt: number = 0;

	constructor(
		game: Phaser.Game,
		deviceController: DeviceController,
		gameData: GameData,
		gameConfiguration: GameConfiguration,
		skinManager: SkinManager,
		streamBundler: StreamBundler,
		normalizedTime: NormalizedTime,
		serverAdapter: ServerAdapter
	) {
		this.game = game;
		this.deviceController = deviceController;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.skinManager = skinManager;
		this.streamBundler = streamBundler;
		this.normalizedTime = normalizedTime;
		this.serverAdapter = serverAdapter;

		this.animations = new Animations(this);
		this.level = new Level(
			this,
			this.gameConfiguration,
			this.skinManager
		);
		this.artificialIntelligence = new ArtificialIntelligence();
		this.players = new Players(
			this,
			this.deviceController,
			this.gameData,
			this.gameConfiguration,
			this.streamBundler,
			this.normalizedTime,
			this.animations,
			this.level,
			this.artificialIntelligence
		);
		this.balls = new Balls(
			this,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.normalizedTime,
			this.animations,
			this.level
		);
		this.bonuses = new Bonuses(
			this,
			this.gameData,
			this.gameConfiguration,
			this.skinManager,
			this.streamBundler,
			this.normalizedTime,
			this.serverAdapter,
			this.animations,
			this.level,
			this.players
		);
		this.scaleManager = new ScaleManager(
			this,
			this.gameConfiguration
		);
	}

	preload() {
		this.skinManager.preload(this.game.load);
		this.level.preload();
	}

	create() {
		this.scaleManager.init();
		this.skinManager.createBackgroundComponents(this.game.add);
		this.createComponents();
		this.deviceController.startMonitoring();

		if (this.gameData.getCurrentPlayerKey()) {
			Session.set('userCurrentlyPlaying', true);
		}

		this.gameInitiated = true;
		this.artificialIntelligence.startGame();
		this.resumeOnTimerEnd();
	}

	update() {
		this.streamBundler.resetBundledStreams();

		this.players.beforeUpdate();
		this.balls.beforeUpdate();

		this.players.update(this.balls.artificialIntelligencePositionsData(), this.bonuses);
		this.balls.update();
		this.bonuses.update();
		this.countdown.update();

		if (!this.gameIsOnGoing()) {
			this.stopGame();
			this.onGameEnd();
		}

		this.streamBundler.emitBundledStream(
			'sendBundledData-' + this.gameData.gameId,
			this.normalizedTime.getTime()
		);
	}

	destroy() {
		this.scaleManager.destroy();
	}

	onGameReplayStarted() {
		if (this.gameInitiated) {
			this.resumeOnTimerEnd();
		}
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.lastPointAt = this.normalizedTime.getTime();
			this.level.shakeGround();
			this.resumeOnTimerEnd();
		}
	}

	cheer(forHost: boolean) {
		if (!this.gameInitiated) {
			return;
		}

		this.skinManager.cheer(
			this.game.add,
			forHost
		);
	}

	showBallHitPoint(x: number, y: number, diameter: number) {
		const radius = diameter / 2;
		const hitPoint = this.game.add.graphics(x, y);
		hitPoint.lineStyle(2, 0xffffff);
		hitPoint.drawCircle(
			0,
			0,
			radius
		);

		// @ts-ignore
		hitPoint.depth = DEPTH_ACTIVATION_ANIMATION;
		this.zIndexGroup.add(hitPoint);

		this.animations.activate(
			hitPoint,
			function() {
				if (hitPoint) {
					hitPoint.destroy();
				}
			}
		);
	}

	showBallHitCount(x: number, y: number, ballHitCount: number, color: string) {
		const countText = this.game.add.text(
			x,
			y,
			ballHitCount.toString(),
			{font: "35px 'Oxygen Mono', sans-serif", fill: color, align: 'center'}
		);
		countText.smoothed = true;
		countText.anchor.setTo(0.5);

		// @ts-ignore
		countText.depth = DEPTH_ACTIVATION_ANIMATION;
		this.zIndexGroup.add(countText);

		this.animations.disappear(
			countText,
			() => {
				if (countText) {
					countText.destroy();
				}
			}
		);
	}

	killClientPlayer(playerKey: string, killedAt: number) {
		if (killedAt > this.lastPointAt) {
			this.removePlayer(playerKey);
		}
	}

	nukeAllPlayers() {
		if (this.gameResumed === true) {
			const players = [].concat(this.players.hostPlayerKeys(true), this.players.clientPlayerKeys(true));

			for (let player of players) {
				this.killPlayer(player);
			}

			this.level.nuke();
		}
	}

	killPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (this.canAddGamePoint() && player && !player.isInvincible && !player.killed) {
			this.removePlayer(playerKey);

			//Send to client
			const serverTimestamp = this.normalizedTime.getTime();
			this.streamBundler.emitStream(
				'killPlayer-' + this.gameData.gameId,
				{
					playerKey: playerKey,
					killedAt: serverTimestamp
				},
				serverTimestamp
			);
		}
	}

	removePlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (player && !player.killing && !player.killed) {
			player.killing = true;

			player.killWithAnimation();
			this.bonuses.resetBonusesForPlayerKey(playerKey);

			player.killing = false;
		}
	}

	canAddGamePoint(): boolean {
		return (
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		);
	}

	moveClientPlayer(data: PositionData) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.players.moveClientPlayer(data);
	}

	moveClientBall(data: PositionData) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.balls.moveClientBall(data);
	}

	createBonus(data: BonusStreamData) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.bonuses.createBonus(data);
	}

	activateBonus(
		bonusIdentifier: string,
		playerKey: string,
		activatedAt: number,
		x: number,
		y: number,
		beforeActivationData: any
	) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.bonuses.activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData);
	}

	moveClientBonus(bonusIdentifier: string, data: BonusPositionData) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.bonuses.moveClientBonus(bonusIdentifier, data);
	}

	onBallCollidesPlayer(ballBody: Phaser.Physics.P2.Body, playerBody: Phaser.Physics.P2.Body) {
		if (!playerBody.sprite) {
			return;
		}

		const player: Player = playerBody.sprite.data.owner;
		const ball: Ball = ballBody.sprite.data.owner;

		this.players.onPlayerHitBall(player, ball);
	}

	onBonusCollidesPlayer(bonusBody: Phaser.Physics.P2.Body, playerBody: Phaser.Physics.P2.Body) {
		if (!playerBody.sprite) {
			return;
		}

		const player: Player = playerBody.sprite.data.owner;
		const bonus: Bonus = bonusBody.sprite.data.owner;

		this.bonuses.onPlayerHitBonus(player, bonus);
	}

	onBallCollidesLimit(ballBody: Phaser.Physics.P2.Body, levelBody: Phaser.Physics.P2.Body) {
		if (this.gameConfiguration.groundHitEnabled() && levelBody === this.level.ballGround()) {
			const ball: Ball = ballBody.sprite.data.owner;

			this.onBallHitScoreZone(ball);
		}
	}

	onBallCollidesSoccerNet(ballBody: Phaser.Physics.P2.Body, levelBody: Phaser.Physics.P2.Body) {
		if (levelBody === this.level.soccerNetHostPointZone() || levelBody === this.level.soccerNetClientPointZone()) {
			const ball: Ball = ballBody.sprite.data.owner;

			this.onBallHitScoreZone(ball);
		}
	}

	sortWorldComponents() {
		this.zIndexGroup.sort('depth', Phaser.Group.SORT_ASCENDING);
	}

	private createComponents() {
		this.level.createComponentsPrerequisites();

		this.level.createFieldLimits(true);

		this.zIndexGroup = this.game.add.group();
		this.level.createGround();
		this.level.createNet();
		this.level.createSoccerNet();

		this.artificialIntelligence.initFromData(this, this.gameData, this.gameConfiguration);
		this.players.create();
		this.balls.create();

		this.countdown = new Countdown(
			this,
			this.gameData,
			this.gameConfiguration,
			this.normalizedTime
		);
	}

	private resumeOnTimerEnd() {
		if (this.gameData.hasGameStatusEndedWithAWinner()) {
			this.pauseGame();
			this.onGameEnd();
		} else if (this.gameIsOnGoing()) {
			this.bonuses.reset();
			this.resetPlayersAndBall();
			this.pauseGame();

			this.artificialIntelligence.startPoint();
			this.startCountdownTimer();
		}
	}

	private startCountdownTimer() {
		this.countdown.start(
			() => {
				this.bonuses.resumeGame();
				this.resumeGame();
			}
		);
	}

	private pauseGame() {
		this.gameResumed = false;
		this.players.freeze();
		this.balls.freeze();
	}

	private stopGame() {
		this.players.stopGame();
		this.balls.stopGame();
		this.bonuses.stopGame();
	}

	private resumeGame() {
		this.players.unfreeze();
		this.balls.unfreeze();
		this.gameResumed = true;
	}

	private onGameEnd() {
		if (!this.gameHasEnded) {
			this.deviceController.stopMonitoring();
			Session.set('userCurrentlyPlaying', false);
			this.gameHasEnded = true;
		}
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}

	private resetPlayersAndBall() {
		this.players.reset();
		this.balls.reset(this.gameData.lastPointTaken);
	}

	private onBallHitScoreZone(ball: Ball) {
		let pointSide;

		if (ball.x() < this.gameConfiguration.width() / 2) {
			pointSide = CLIENT_POINTS_COLUMN;
		} else {
			pointSide = HOST_POINTS_COLUMN;
		}

		if (this.canAddGamePoint() && this.canAddPointOnSide(pointSide)) {
			//Send to client
			this.streamBundler.emitStream(
				'showBallHitPoint-' + this.gameData.gameId,
				{
					x: ball.x(),
					y: ball.y(),
					diameter: ball.diameter()
				},
				this.normalizedTime.getTime()
			);
			this.showBallHitPoint(
				ball.x(),
				ball.y(),
				ball.diameter()
			);

			this.gameResumed = false;

			this.serverAdapter.send(
				'addGamePoints',
				[
					this.gameData.gameId,
					pointSide
				]
			);

			this.artificialIntelligence.stopPoint(pointSide);
		}
	}

	private canAddPointOnSide(side): boolean {
		if (side === CLIENT_POINTS_COLUMN) {
			if (this.players.hasInvincibleHost()) {
				return false;
			}
		} else {
			if (this.players.hasInvincibleClient()) {
				return false;
			}
		}

		return true;
	}
}
