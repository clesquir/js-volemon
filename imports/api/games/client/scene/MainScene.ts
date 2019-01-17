import DeviceController from "../../deviceController/DeviceController";
import GameData from "../../data/GameData";
import GameConfiguration from "../../configuration/GameConfiguration";
import SkinManager from "../skin/SkinManager";
import StreamBundler from "../streamBundler/StreamBundler";
import ServerNormalizedTime from "../ServerNormalizedTime";
import Level from "../components/Level";
import Player from "../components/Player";
import Ball from "../components/Ball";
import ArtificialIntelligence from "../../artificialIntelligence/ArtificialIntelligence";
import {CLIENT_POINTS_COLUMN, HOST_POINTS_COLUMN} from "../../constants";
import {BALL_INTERVAL, PLAYER_INTERVAL} from "../../emissionConstants";
import {PositionData} from "../components/PositionData";
import Countdown from "../components/Countdown";
import Animations from "../components/Animations";

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
	eventEmitter: Phaser.Events.EventEmitter;

	player1: Player;
	player2: Player;
	player3: Player;
	player4: Player;
	ball: Ball;
	countdown: Countdown;

	gameInitiated: boolean = false;
	gameResumed: boolean = false;
	gameHasEnded: boolean = false;
	hostNumberBallHits: number = 0;
	clientNumberBallHits: number = 0;

	lastPlayerPositionData: { [key: string]: PositionData } = {};
	lastBallPositionData: PositionData;
	lastPlayerUpdate: { [key: string]: number } = {};
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

		this.eventEmitter = new Phaser.Events.EventEmitter();
		this.matter.world.on('collisionstart', (event) => this.onCollision(event, 'collisionstart'), this);
		this.matter.world.on('collisionactive', (event) => this.onCollision(event, 'collisionactive'), this);
		this.matter.world.on('collisionend', (event) => this.onCollision(event, 'collisionend'), this);

		//Improve Continuous Collision Detection
		this.matter.world.engine.positionIterations = 64;
		this.matter.world.engine.velocityIterations = 64;
		this.matter.world.engine.constraintIterations = 2;
	}

	preload() {
		this.skinManager.preload(this.load);
		this.level.preload();
	}

	create() {
		this.skinManager.createBackgroundComponents(this);
		this.createComponents();
		this.deviceController.startMonitoring();

		if (this.getCurrentPlayer()) {
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

		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				if (this.gameData.isUserCreator() && player.isFrozen) {
					player.freeze();
				}

				player.updateEye(this.ball);
			}
		}

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserCreator() && this.ball.isFrozen) {
			this.ball.freeze();
		}

		if (this.gameIsOnGoing()) {
			this.inputs();

			for (let key of this.getComputerPlayerKeys()) {
				const player = this.getPlayerFromKey(key);

				if (player) {
					this.moveComputer(player);
				}
			}

			this.ball.constrainVelocity();

			//@todo Bonus
			// if (this.gameData.hasBonuses) {
			// 	this.gameBonus.onUpdateGameOnGoing();
			// }

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

	createComponents() {
		this.level.createCollisionCategories();

		this.artificialIntelligence.initFromData(this.gameData);

		this.player1 = this.createPlayer('player1', '#a73030', true);
		this.player2 = this.createPlayer('player2', '#274b7a', false);

		if (this.gameData.isTwoVersusTwo()) {
			this.player3 = this.createPlayer('player3', '#d46969', true);
			this.player4 = this.createPlayer('player4', '#437bc4', false);
		}

		this.ball = this.createBall();

		this.level.createGround();
		this.level.createNet();
		this.level.createFieldLimits(true);

		this.countdown = new Countdown(
			this.gameData,
			this.serverNormalizedTime
		);
	}

	resumeOnTimerEnd() {
		this.pauseGame();

		if (this.gameData.hasGameStatusEndedWithAWinner()) {
			this.onGameEnd();
		} else if (this.gameIsOnGoing()) {
			//@todo Bonus
			// this.gameBonus.reset();
			this.resetPlayersAndBall();

			this.artificialIntelligence.startPoint();
			this.startCountdownTimer();
		}
	}

	startCountdownTimer() {
		this.countdown.start(
			() => {
				//@todo Bonus
				// this.gameBonus.resumeGame();
				this.resumeGame();
			}
		);
	}

	pauseGame() {
		this.ball.freeze();
	}

	stopGame() {
		for (let key of this.getPlayerKeys(true)) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				player.freeze();
			}
		}
		this.ball.freeze();

		//@todo Bonus
		// this.gameBonus.onGameStop();
	}

	resumeGame() {
		this.ball.unfreeze();
		this.gameResumed = true;
	}

	onGameEnd() {
		if (!this.gameHasEnded) {
			this.deviceController.stopMonitoring();
			Session.set('userCurrentlyPlaying', false);
			this.gameHasEnded = true;
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
			this.onPlayerHitBall(bodyA.gameObject.getData('owner'), bodyB.gameObject.getData('owner'));
		}
	}

	private collidePlayerBonus({bodyA, bodyB}) {
		if (bodyA.gameObject && bodyA.gameObject.getData('isPlayer') && bodyB.gameObject && bodyB.gameObject.getData('isBonus')) {
			//@todo Bonus
		}
	}

	private collideBallGround({bodyA, bodyB}) {
		if (bodyA.gameObject && bodyA.gameObject.getData('isBall') && bodyB === this.level.ballGround()) {
			this.onBallHitGround(bodyA.gameObject.getData('owner'));
		}
	}

	private createPlayer(key, color, isHost): Player {
		return new Player(
			this,
			this.gameConfiguration,
			this.gameData,
			this.level,
			key,
			color,
			isHost
		);
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

	private inputs() {
		const player = this.getCurrentPlayer();

		if (!player) {
			return;
		}

		player.movePlayer(
			this.deviceController.leftPressed(),
			this.deviceController.rightPressed(),
			this.deviceController.upPressed(),
			this.deviceController.downPressed()
		);

		this.sendPlayerPosition(player);
	}

	private sendPlayerPosition(player: Player) {
		let playerPositionData = player.positionData();
		let playerInterval = PLAYER_INTERVAL;

		const key = player.key;

		if (JSON.stringify(this.lastPlayerPositionData[key]) === JSON.stringify(playerPositionData)) {
			playerInterval *= 2;
		}
		this.lastPlayerPositionData[key] = Object.assign({}, playerPositionData);

		this.lastPlayerUpdate[key] = this.streamBundler.addToBundledStreamsAtFrequence(
			this.lastPlayerUpdate[key] || 0,
			playerInterval,
			'moveClientPlayer-' + key,
			playerPositionData
		);
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

	private moveComputer(player: Player) {
		const key = player.key;

		//Creator user controls CPU
		if (!this.gameData.isUserCreator()) {
			return;
		}

		this.artificialIntelligence.computeMovement(
			key,
			player.artificialIntelligenceData(),
			player.artificialIntelligencePositionData(),
			this.ball.artificialIntelligencePositionData(),
			[],
			this.gameConfiguration
		);

		player.movePlayer(
			this.artificialIntelligence.movesLeft(key),
			this.artificialIntelligence.movesRight(key),
			this.artificialIntelligence.jumps(key),
			this.artificialIntelligence.dropshots(key)
		);
	}

	private resetPlayersAndBall() {
		this.resetHostNumberBallHits();
		this.resetClientNumberBallHits();
		this.player1.reset();
		this.player2.reset();
		if (this.gameData.isTwoVersusTwo()) {
			this.player3.reset();
			this.player4.reset();
		}
		this.ball.reset(this.gameData.lastPointTaken);
	}

	private resetHostNumberBallHits() {
		this.hostNumberBallHits = 0;
	}

	private resetClientNumberBallHits() {
		this.clientNumberBallHits = 0;
	}

	private incrementBallHitsOnBallHitPlayer(player: Player, ball: Ball) {
		//Threshold to avoid several calculations for the same "touch"
		if (
			(new Date()).getTime() - player.lastBallHit > 500 &&
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		) {
			player.lastBallHit = (new Date()).getTime();

			let playerNumberBallHits = ++player.numberBallHits;
			let teamNumberBallHits = 0;
			if (player.isHost) {
				//Increment hit
				teamNumberBallHits = ++this.hostNumberBallHits;
				//Reset opponent
				this.resetClientNumberBallHits();
			} else if (!player.isHost) {
				//Increment hit
				teamNumberBallHits = ++this.clientNumberBallHits;
				//Reset opponent
				this.resetHostNumberBallHits();
			}

			//Reset other players
			this.resetPlayerNumberBallHitsForOthers(player);

			this.killPlayerOnBallHit(player, teamNumberBallHits, playerNumberBallHits);

			this.showTeamBallHitCount(player, ball, teamNumberBallHits);
		}
	}

	private resetPlayerNumberBallHitsForOthers(player: Player) {
		const playerKeys = this.getPlayerKeys();

		for (let playerKey of playerKeys) {
			if (player.key !== playerKey) {
				const otherPlayer = this.getPlayerFromKey(playerKey);
				if (otherPlayer) {
					otherPlayer.resetBallHits();
				}
			}
		}
	}

	private killPlayerOnBallHit(player: Player, teamNumberBallHits: number, playerNumberBallHits: number) {
		if (this.gameConfiguration.exceedsTeamMaximumBallHit(teamNumberBallHits)) {
			//Kill the team
			if (player.isHost) {
				for (let key of this.hostPlayerKeys()) {
					this.delayKillPlayer(key);
				}
			} else if (!player.isHost) {
				for (let key of this.clientPlayerKeys()) {
					this.delayKillPlayer(key);
				}
			}
		} else if (this.gameConfiguration.exceedsPlayerMaximumBallHit(playerNumberBallHits)) {
			this.delayKillPlayer(player.key);
		}
	}

	private delayKillPlayer(key: string) {
		setTimeout(() => {
			//@todo Bonus
			// this.gameBonus.killPlayer(key);
		}, 100);
	}

	private showTeamBallHitCount(player: Player, ball: Ball, teamNumberBallHits: number) {
		if (this.gameConfiguration.overridesTeamMaximumBallHit()) {
			const x = ball.x();
			const y = ball.y();
			let color = player.isHost ? '#c94141' : '#3363a1';

			this.showBallHitCount(x, y, teamNumberBallHits, color);

			//Send to client
			const serverTimestamp = this.serverNormalizedTime.getServerTimestamp();
			this.streamBundler.emitStream(
				'showBallHitCount-' + this.gameData.gameId,
				{
					x: x,
					y: y,
					ballHitCount: teamNumberBallHits,
					color: color
				},
				serverTimestamp
			);
		}
	}

	private onPlayerHitBall(player: Player, ball: Ball) {
		if (this.gameConfiguration.playerDropshotEnabled() && player.dropShots) {
			ball.dropshot();
		} else {
			if (
				this.gameConfiguration.playerSmashEnabled() &&
				player.isSmashing(ball.x())
			) {
				ball.smash(player.isHost);
			} else if (
				this.gameConfiguration.ballReboundOnPlayerEnabled() &&
				!player.isBallBelow(ball.y())
			) {
				ball.rebound();
			}
		}

		ball.constrainVelocity();

		this.incrementBallHitsOnBallHitPlayer(player, ball);
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

			Meteor.apply('addGamePoints', [this.gameData.gameId, pointSide]);

			this.artificialIntelligence.stopPoint(pointSide);
		}
	}

	private getCurrentPlayer(): Player | null {
		//@todo Create Players class and put all that stuff there
		const key = this.gameData.getCurrentPlayerKey();

		return this.getPlayerFromKey(key);
	}

	private getPlayerFromKey(playerKey, includeRobot = true): Player | null {
		switch (playerKey) {
			case 'player1':
				return this.player1;
			case 'player2':
				return this.player2;
			case 'player3':
				return this.player3;
			case 'player4':
				return this.player4;
		}

		if (includeRobot) {
			//@todo Robot
			// for (let i in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(i) && i === playerKey) {
			// 		return this.gameBonus.robots[i];
			// 	}
			// }
		}

		return null;
	}

	private hostPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player1'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player3');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerHostSide(this.gameBonus.robots[robotId])) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
	}

	private clientPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player2'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player4');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerClientSide(this.gameBonus.robots[robotId])) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
	}

	private getPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [
			'player1',
			'player2'
		];

		if (this.gameData.isTwoVersusTwo()) {
			playerKeys.push('player3');
			playerKeys.push('player4');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let robotId in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(robotId)) {
			// 		playerKeys.push(robotId);
			// 	}
			// }
		}

		return playerKeys;
	}

	private isPlayerKey(key, includeRobot = true): boolean {
		const playerKeys = this.getPlayerKeys(includeRobot);

		return playerKeys.indexOf(key) >= 0;
	}

	private getComputerPlayerKeys(includeRobot = true): string[] {
		const playerKeys = [];

		if (this.gameData.isFirstPlayerComputer()) {
			playerKeys.push('player1');
		}
		if (this.gameData.isSecondPlayerComputer()) {
			playerKeys.push('player2');
		}
		if (this.gameData.isThirdPlayerComputer()) {
			playerKeys.push('player3');
		}
		if (this.gameData.isFourthPlayerComputer()) {
			playerKeys.push('player4');
		}

		if (includeRobot) {
			//@todo Robot
			// for (let i in this.gameBonus.robots) {
			// 	if (this.gameBonus.robots.hasOwnProperty(i)) {
			// 		playerKeys.push(i);
			// 	}
			// }
		}

		return playerKeys;
	}

	private canAddGamePoint(): boolean {
		return (
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		);
	}

	private canAddPointOnSide(side): boolean {
		if (side === CLIENT_POINTS_COLUMN) {
			const hostPlayerKeys = this.hostPlayerKeys(true);

			for (let playerKey of hostPlayerKeys) {
				const player = this.getPlayerFromKey(playerKey, true);

				if (player && player.isInvincible) {
					return false;
				}
			}
		} else {
			const clientPlayerKeys = this.clientPlayerKeys(true);

			for (let playerKey of clientPlayerKeys) {
				const player = this.getPlayerFromKey(playerKey, true);

				if (player && player.isInvincible) {
					return false;
				}
			}
		}

		return true;
	}
}
