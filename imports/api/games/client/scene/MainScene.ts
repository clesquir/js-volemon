import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../component/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import Level from "../component/Level";
import Ball from "../component/Ball";
import ArtificialIntelligence from "../../artificialIntelligence/ArtificialIntelligence";
import {CLIENT_POINTS_COLUMN, DEPTH_ACTIVATION_ANIMATION, HOST_POINTS_COLUMN} from "../../constants";
import {BALL_INTERVAL} from "../../emissionConstants";
import {PositionData} from "../component/PositionData";
import Countdown from "../component/Countdown";
import Animations from "../component/Animations";
import Players from "../component/Players";
import Bonuses from "../component/Bonuses";
import {BonusStreamData} from "../../bonus/data/BonusStreamData";
import ServerAdapter from "../serverAdapter/ServerAdapter";
import {MainSceneConfigurationData} from "./MainSceneConfigurationData";
import {BonusPositionData} from "../../bonus/data/BonusPositionData";
import ScaleManager from "../component/ScaleManager";
import Player from "../component/Player";
import Bonus from "../component/Bonus";

const Phaser = require('phaser');

export default class MainScene extends Phaser.Scene {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;
	serverAdapter: ServerAdapter;

	animations: Animations;
	level: Level;
	artificialIntelligence: ArtificialIntelligence;
	players: Players;
	eventEmitter: Phaser.Events.EventEmitter;
	bonuses: Bonuses;
	scaleManager: ScaleManager;

	ball: Ball;
	countdown: Countdown;

	gameInitiated: boolean = false;
	gameResumed: boolean = false;
	gameHasEnded: boolean = false;

	lastPointAt: number = 0;
	lastBallPositionData: PositionData;
	lastBallUpdate: number = 0;

	constructor() {
		super('MainScene');
	}

	init(config: MainSceneConfigurationData) {
		this.deviceController = config.deviceController;
		this.gameData = config.gameData;
		this.gameConfiguration = config.gameConfiguration;
		this.skinManager = config.skinManager;
		this.streamBundler = config.streamBundler;
		this.serverNormalizedTime = config.serverNormalizedTime;
		this.serverAdapter = config.serverAdapter;

		this.animations = new Animations(this);
		this.level = new Level(
			this,
			this.gameConfiguration,
			this.skinManager
		);
		this.artificialIntelligence = new ArtificialIntelligence();
		this.players = new Players(
			this,
			this.gameData,
			this.gameConfiguration,
			this.streamBundler,
			this.serverNormalizedTime,
			this.animations,
			this.level,
			this.artificialIntelligence
		);
		this.bonuses = new Bonuses(
			this,
			this.gameData,
			this.gameConfiguration,
			this.streamBundler,
			this.serverNormalizedTime,
			this.serverAdapter,
			this.animations,
			this.level,
			this.players
		);
		this.scaleManager = new ScaleManager(
			this,
			this.gameConfiguration
		);

		this.eventEmitter = new Phaser.Events.EventEmitter();
		this.matter.world.on('beforeupdate', () => this.onBeforeUpdate(), this);
		this.matter.world.on('collisionstart', (event) => this.onCollision(event, 'collisionstart'), this);
		this.matter.world.on('collisionactive', (event) => this.onCollision(event, 'collisionactive'), this);
		this.matter.world.on('collisionend', (event) => this.onCollision(event, 'collisionend'), this);

		//Improve Continuous Collision Detection
		this.matter.world.engine.positionIterations = 64;
		this.matter.world.engine.velocityIterations = 64;
		this.matter.world.engine.constraintIterations = 10;
	}

	preload() {
		this.skinManager.preload(this.load);
		this.level.preload();
	}

	create() {
		this.scaleManager.init();
		this.skinManager.createBackgroundComponents(this);
		this.createComponents();
		this.deviceController.startMonitoring();

		if (this.gameData.getCurrentPlayerKey()) {
			Session.set('userCurrentlyPlaying', true);
		}

		this.eventEmitter.on('collisionstart', this.onCollisionStart, this);
		this.eventEmitter.on('collisionactive', this.onCollisionActive, this);
		this.eventEmitter.on('collisionend', this.onCollisionEnd, this);

		this.gameInitiated = true;
		this.artificialIntelligence.startGame();
		this.resumeOnTimerEnd();
	}

	update() {
		this.streamBundler.resetBundledStreams();
		this.players.beforeUpdate();
		this.players.updateEyes(this.ball);

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserCreator() && this.ball.isFrozen) {
			this.ball.freeze();
		}

		if (this.gameIsOnGoing()) {
			//@todo Move this to `this.players.update();`
			this.players.inputs(this.deviceController);
			this.players.moveComputers(
				this.ball.artificialIntelligencePositionData(),
				this.bonuses.artificialIntelligencePositionData()
			);
			this.ball.constrainVelocity();

			if (this.gameData.hasBonuses) {
				this.bonuses.update();
			}

			this.countdown.update();
		} else {
			this.stopGame();
			this.onGameEnd();
		}

		if (this.gameData.isUserCreator()) {
			this.sendBallPosition();
		}

		this.streamBundler.emitBundledStream(
			'sendBundledData-' + this.gameData.gameId,
			this.serverNormalizedTime.getServerTimestamp()
		);
	}

	destroy() {
		this.scaleManager.destroy();
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
			this.level.shakeGround();
			this.resumeOnTimerEnd();
		}
	}

	cheer(forHost: boolean) {
		if (!this.gameInitiated) {
			return;
		}

		this.skinManager.cheer(
			this,
			forHost
		);
	}

	showBallHitPoint(x: number, y: number, diameter: number) {
		const radius = diameter / 2;
		const hitPoint = this.add.graphics({
			x: x,
			y: y
		});
		hitPoint.lineStyle(2, 0xffffff);
		hitPoint.strokeCircle(
			0,
			0,
			radius
		);
		hitPoint.setDepth(DEPTH_ACTIVATION_ANIMATION);

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
		const countText = this.add.text(
			x,
			y,
			ballHitCount,
			{fontFamily: "'Oxygen Mono', sans-serif", fontSize: 35, color: color, align: 'center'}
		);
		countText.setOrigin(0.5);

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

	killPlayer(playerKey: string) {
		const player = this.players.getPlayerFromKey(playerKey);

		if (this.canAddGamePoint() && player && !player.isInvincible && !player.killed) {
			this.removePlayer(playerKey);

			//Send to client
			const serverTimestamp = this.serverNormalizedTime.getServerTimestamp();
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

			this.bonuses.resetBonusesForPlayerKey(playerKey);
			player.kill();

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
		if (!this.gameInitiated || !this.ball || !this.gameIsOnGoing()) {
			return;
		}

		this.ball.interpolate(data);
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

	private createComponents() {
		this.level.createCollisionCategories();

		this.artificialIntelligence.initFromData(this, this.gameData, this.gameConfiguration);
		this.players.create();
		this.ball = this.createBall();

		this.level.createGround();
		this.level.createNet();
		this.level.createFieldLimits(true);

		this.countdown = new Countdown(
			this,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime
		);
	}

	private resumeOnTimerEnd() {
		this.pauseGame();

		if (this.gameData.hasGameStatusEndedWithAWinner()) {
			this.onGameEnd();
		} else if (this.gameIsOnGoing()) {
			this.bonuses.reset();
			this.resetPlayersAndBall();

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
		this.ball.freeze();
	}

	private stopGame() {
		this.players.freeze();
		this.ball.freeze();
		this.bonuses.freeze();
	}

	private resumeGame() {
		this.ball.unfreeze();
		this.gameResumed = true;
	}

	private onGameEnd() {
		if (!this.gameHasEnded) {
			this.deviceController.stopMonitoring();
			Session.set('userCurrentlyPlaying', false);
			this.gameHasEnded = true;
		}
	}

	private onBeforeUpdate() {
		this.eventEmitter.emit('beforebeforeupdate');
		this.eventEmitter.emit('beforeupdate');
		this.eventEmitter.emit('afterbeforeupdate');
	}

	private onCollision(event, eventName) {
		for (let pair of event.pairs) {
			const bodiesAB = {
				bodyA: pair.bodyA,
				bodyB: pair.bodyB
			};
			this.eventEmitter.emit('before' + eventName, bodiesAB);
			this.eventEmitter.emit(eventName, bodiesAB);
			this.eventEmitter.emit('after' + eventName, bodiesAB);

			const bodiesBA = {
				bodyA: pair.bodyB,
				bodyB: pair.bodyA
			};
			this.eventEmitter.emit('before' + eventName, bodiesBA);
			this.eventEmitter.emit(eventName, bodiesBA);
			this.eventEmitter.emit('after' + eventName, bodiesBA);
		}
	}

	private onCollisionStart({bodyA, bodyB}) {
		this.collidePlayerBonus({bodyA, bodyB});
		this.collideBallGround({bodyA, bodyB});
	}

	private onCollisionActive({bodyA, bodyB}) {
		this.collidePlayerBall({bodyA, bodyB});
	}

	private onCollisionEnd({bodyA, bodyB}) {
		this.collidePlayerBall({bodyA, bodyB});
	}

	private collidePlayerBall({bodyA, bodyB}) {
		if (
			bodyA.gameObject && bodyA.gameObject.getData('isPlayer') && !bodyA.isSensor &&
			bodyB.gameObject && bodyB.gameObject.getData('isBall')
		) {
			const player: Player = bodyA.gameObject.getData('owner');
			const ball: Ball = bodyB.gameObject.getData('owner');

			this.players.onPlayerHitBall(player, ball);
		}
	}

	private collidePlayerBonus({bodyA, bodyB}) {
		if (
			bodyA.gameObject && bodyA.gameObject.getData('isPlayer') && !bodyA.isSensor &&
			bodyB.gameObject && bodyB.gameObject.getData('isBonus')
		) {
			const player: Player = bodyA.gameObject.getData('owner');
			const bonus: Bonus = bodyB.gameObject.getData('owner');

			this.bonuses.onPlayerHitBonus(player, bonus);
		}
	}

	private collideBallGround({bodyA, bodyB}) {
		if (
			bodyA.gameObject && bodyA.gameObject.getData('isBall') &&
			bodyB === this.level.ballGround()
		) {
			const ball: Ball = bodyA.gameObject.getData('owner');

			this.onBallHitGround(ball);
		}
	}

	private createBall(): Ball {
		return new Ball(
			this,
			this.gameData,
			this.gameConfiguration,
			this.serverNormalizedTime,
			this.skinManager,
			this.level
		);
	}

	private gameIsOnGoing(): boolean {
		return this.gameData.isGameStatusStarted();
	}

	private sendBallPosition() {
		let ballPositionData = this.ball.positionData();
		let ballInterval = BALL_INTERVAL;

		if (JSON.stringify(this.lastBallPositionData) === JSON.stringify(ballPositionData)) {
			ballInterval *= 2;
		}
		this.lastBallPositionData = Object.assign({}, ballPositionData);

		this.lastBallUpdate = this.streamBundler.addToBundledStreamsAtFrequence(
			this.lastBallUpdate,
			ballInterval,
			'moveClientBall',
			ballPositionData
		);
	}

	private resetPlayersAndBall() {
		this.players.reset();
		this.ball.reset(this.gameData.lastPointTaken);
	}

	private onBallHitGround(ball: Ball) {
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
				this.serverNormalizedTime.getServerTimestamp()
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
