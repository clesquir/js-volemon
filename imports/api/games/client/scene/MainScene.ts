import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../skin/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import Level from "../components/Level";
import Ball from "../components/Ball";
import ArtificialIntelligence from "../../artificialIntelligence/ArtificialIntelligence";
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from "../../constants";
import {BALL_INTERVAL} from "../../emissionConstants";
import {PositionData} from "../components/PositionData";
import Countdown from "../components/Countdown";
import Animations from "../components/Animations";
import Players from "../components/Players";
import Bonuses from "../components/Bonuses";
import {BonusStreamData} from "../../bonus/BonusStreamData";

const Phaser = require('phaser');

export default class MainScene extends Phaser.Scene {
	deviceController: DeviceController;
	gameData: GameData;
	gameConfiguration: GameConfiguration;
	skinManager: SkinManager;
	streamBundler: StreamBundler;
	serverNormalizedTime: ServerNormalizedTime;

	animations: Animations;
	level: Level;
	artificialIntelligence: ArtificialIntelligence;
	players: Players;
	eventEmitter: Phaser.Events.EventEmitter;
	bonuses: Bonuses;

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

	init(config) {
		this.deviceController = config.deviceController;
		this.gameData = config.gameData;
		this.gameConfiguration = config.gameConfiguration;
		this.skinManager = config.skinManager;
		this.streamBundler = config.streamBundler;
		this.serverNormalizedTime = config.serverNormalizedTime;

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
			this.level
		);

		this.eventEmitter = new Phaser.Events.EventEmitter();
		this.matter.world.on('collisionstart', (event) => this.onCollision(event, 'collisionstart'), this);
		this.matter.world.on('collisionactive', (event) => this.onCollision(event, 'collisionactive'), this);
		this.matter.world.on('collisionend', (event) => this.onCollision(event, 'collisionend'), this);

		//Improve Continuous Collision Detection
		this.matter.world.engine.positionIterations = 64;
		this.matter.world.engine.velocityIterations = 64;
		this.matter.world.engine.constraintIterations = 2;
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
			this.shakeLevel();
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

		this.animations.activate(hitPoint);
	}

	showBallHitCount(x: number, y: number, ballHitCount: number, color: string) {
		const countText = this.add.text(
			x,
			y,
			ballHitCount,
			{fontFamily: "'Oxygen Mono', sans-serif", fontSize: 35, color: color, align: 'center'}
		);
		countText.setOrigin(0.5);

		this.animations.disappear(countText);
	}

	shakeLevel() {
		//@todo Shake
	}

	killPlayer(playerKey: string, killedAt: number) {
		if (killedAt > this.lastPointAt) {
			this.bonuses.resetBonusesForPlayerKey(playerKey);
			this.players.killAndRemovePlayer(playerKey);
		}
	}

	canAddGamePoint(): boolean {
		return (
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		);
	}

	moveClientPlayer(data: any) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.players.moveClientPlayer(data);
	}

	moveClientBall(data: any) {
		if (!this.gameInitiated || !this.ball || !this.gameIsOnGoing()) {
			return;
		}

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		//@todo Interpolate client ball movements - in ball class
		// this.engine.interpolateMoveTo(this.ball, serverNormalizedTimestamp, data, () => {return this.gameIsOnGoing()});
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

	moveClientBonus(bonusIdentifier: string, data: any) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.bonuses.moveClientBonus(bonusIdentifier, data);
	}

	private preload() {
		this.skinManager.preload(this.load);
		this.level.preload();
	}

	private create() {
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

	private update() {
		this.streamBundler.resetBundledStreams();
		this.players.beforeUpdate();
		this.players.updateEyes(this.ball);

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserCreator() && this.ball.isFrozen) {
			this.ball.freeze();
		}

		if (this.gameIsOnGoing()) {
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

			if (this.gameData.isUserCreator()) {
				this.sendBallPosition();
			}
		} else {
			this.stopGame();
			this.onGameEnd();
		}

		this.streamBundler.emitBundledStream(
			'sendBundledData-' + this.gameData.gameId,
			this.serverNormalizedTime.getServerTimestamp()
		);
	}

	private createComponents() {
		this.level.createCollisionCategories();

		this.artificialIntelligence.initFromData(this.gameData);
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

	private onCollision(event, eventName) {
		for (let pair of event.pairs) {
			this.eventEmitter.emit(
				eventName, {
					bodyA: pair.bodyA,
					bodyB: pair.bodyB
				}
			);
			this.eventEmitter.emit(
				eventName, {
					bodyA: pair.bodyB,
					bodyB: pair.bodyA
				}
			);
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
		if (bodyA.gameObject && bodyA.gameObject.getData('isPlayer') && bodyB.gameObject && bodyB.gameObject.getData('isBall')) {
			this.players.onPlayerHitBall(bodyA.gameObject.getData('owner'), bodyB.gameObject.getData('owner'));
		}
	}

	private collidePlayerBonus({bodyA, bodyB}) {
		if (bodyA.gameObject && bodyA.gameObject.getData('isPlayer') && bodyB.gameObject && bodyB.gameObject.getData('isBonus')) {
			this.bonuses.onPlayerHitBonus(bodyA.gameObject.getData('owner'), bodyB.gameObject.getData('owner'));
		}
	}

	private collideBallGround({bodyA, bodyB}) {
		if (bodyA.gameObject && bodyA.gameObject.getData('isBall') && bodyB === this.level.ballGround()) {
			this.onBallHitGround(bodyA.gameObject.getData('owner'));
		}
	}

	private createBall(): Ball {
		return new Ball(
			this,
			this.gameConfiguration,
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

			//@todo Add an interface for Meteor.apply
			Meteor.apply('addGamePoints', [this.gameData.gameId, pointSide]);

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
