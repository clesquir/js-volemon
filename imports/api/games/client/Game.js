import GameBonus from '/imports/api/games/client/bonus/GameBonus.js';
import Collisions from '/imports/api/games/collisions/Collisions.js';
import {
	BALL_GRAVITY_SCALE,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT,
	CLIENT_POINTS_COLUMN,
	CLIENT_SIDE,
	HOST_POINTS_COLUMN,
	HOST_SIDE,
	NORMAL_SCALE_PHYSICS_DATA,
	PLAYER_GRAVITY_SCALE,
	PLAYER_MASS
} from '/imports/api/games/constants.js';
import {BALL_INTERVAL, PLAYER_INTERVAL} from '/imports/api/games/emissionConstants.js';
import LevelComponents from '/imports/api/games/levelComponents/LevelComponents.js';
import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Session} from 'meteor/session';

export default class Game {
	/**
	 * @param {string} gameId
	 * @param {DeviceController} deviceController
	 * @param {Engine} engine
	 * @param {GameData} gameData
	 * @param {GameConfiguration} gameConfiguration
	 * @param {GameSkin} gameSkin
	 * @param {GameStreamBundler} gameStreamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(
		gameId,
		deviceController,
		engine,
		gameData,
		gameConfiguration,
		gameSkin,
		gameStreamBundler,
		serverNormalizedTime
	) {
		this.gameId = gameId;
		this.deviceController = deviceController;
		this.engine = engine;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.gameSkin = gameSkin;
		this.gameStreamBundler = gameStreamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.lastBallPositionData = {};
		this.lastPlayerPositionData = {};
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.gameResumed = false;
		this.gameInitiated = false;
		this.gameStreamBundler.resetBundledStreams();

		this.gameBonus = new GameBonus(
			this,
			this.engine,
			this.gameData,
			this.gameConfiguration,
			this.gameStreamBundler,
			this.serverNormalizedTime
		);
		this.collisions = new Collisions(
			this,
			this.gameBonus,
			this.gameSkin,
			this.gameConfiguration,
			this.engine
		);
		this.levelComponents = new LevelComponents(
			this.collisions,
			this.gameSkin,
			this.engine,
			this.gameConfiguration
		);
	}

	getCurrentPlayer() {
		if (this.gameData.isUserHost()) {
			return this.player1;
		} else if (this.gameData.isUserClient()) {
			return this.player2;
		}

		return null;
	}

	getPlayerFromKey(playerKey) {
		if (playerKey === 'player1') {
			return this.player1;
		} else if (playerKey === 'player2') {
			return this.player2;
		} else {
			return null;
		}
	}

	playerInitialPolygonFromKey(playerKey) {
		const player = this.getPlayerFromKey(playerKey);

		if (player) {
			return player.data.initialPolygonObject.substring(7);
		}

		return null;
	}

	playerCurrentPolygonFromKey(playerKey) {
		const player = this.getPlayerFromKey(playerKey);

		if (player) {
			return player.data.currentPolygonObject.substring(7);
		}

		return null;
	}

	start() {
		this.engine.start(
			{
				width: this.gameConfiguration.width(),
				height: this.gameConfiguration.height(),
				gravity: this.gameConfiguration.worldGravity(),
				bonusRadius: this.gameConfiguration.bonusRadius(),
				renderTo: 'gameContainer'
			},
			this.preloadGame, this.createGame, this.updateGame, this
		);
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.shakeLevel();
			this.resumeOnTimerEnd();
		}
	}

	stop() {
		this.deviceController.stopMonitoring();
		this.engine.stop();
	}

	onGameEnd() {
		if (!this.gameHasEnded) {
			this.reinitPlayer(this.player1);
			this.reinitPlayer(this.player2);

			this.deviceController.stopMonitoring();
			Session.set('userCurrentlyPlaying', false);
			this.gameHasEnded = true;
		}
	}

	preloadGame() {
		this.gameSkin.preload(this.engine);
		this.levelComponents.preload();
	}

	createGame() {
		this.gameSkin.createBackgroundComponents(
			this.engine,
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);
		this.createComponents();
		this.gameBonus.createComponents();

		this.deviceController.startMonitoring();
		this.engine.createGame();

		if (this.getCurrentPlayer()) {
			Session.set('userCurrentlyPlaying', true);
		}

		this.gameInitiated = true;

		this.resumeOnTimerEnd();
	}

	createComponents() {
		this.collisions.init();

		/**
		 * Player 1
		 */
		const player1Key = 'player1';
		this.player1 = this.engine.addSprite(
			this.gameConfiguration.player1InitialX(),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShapeFromKey(player1Key)
		);
		this.player1.data.key = player1Key;
		this.initPlayer(
			this.player1,
			this.gameConfiguration.player1InitialX(),
			this.gameConfiguration.playerInitialY(),
			this.collisions.hostPlayerCollisionGroup
		);

		/**
		 * Player 2
		 */
		const player2Key = 'player2';
		this.player2 = this.engine.addSprite(
			this.gameConfiguration.player2InitialX(),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShapeFromKey(player2Key)
		);
		this.player2.data.key = player2Key;
		this.initPlayer(
			this.player2,
			this.gameConfiguration.player2InitialX(),
			this.gameConfiguration.playerInitialY(),
			this.collisions.clientPlayerCollisionGroup
		);

		this.createBall(
			this.gameConfiguration.ballInitialHostX(),
			this.gameConfiguration.ballInitialY()
		);

		this.levelComponents.createLevelComponents();
		this.addPlayerCanJumpOnBody(this.player1, this.levelComponents.groundBound);
		this.addPlayerCanJumpOnBody(this.player2, this.levelComponents.groundBound);

		this.createCountdownText();
	}

	/**
	 * Override shape only if game is running and for current player (hidden shape)
	 * @param {string} playerKey
	 * @returns {string}
	 */
	playerShapeFromKey(playerKey) {
		if (
			this.gameConfiguration.overridesCurrentPlayerShape() &&
			this.gameData.isGameStatusStarted() &&
			this.gameData.isCurrentPlayerKey(playerKey)
		) {
			return this.gameConfiguration.currentPlayerShape();
		} else {
			return this.gameData.getPlayerShapeFromKey(playerKey);
		}
	}

	createCountdownText() {
		this.countdownText = this.engine.addText(this.engine.getCenterX(), this.engine.getCenterY(), '', {
			font: "75px 'Oxygen Mono', sans-serif",
			fill: '#363636',
			align: 'center'
		});
	}

	addPlayerCanJumpOnBody(player, body) {
		player.data.canJumpOnBodies.push(body);
	}

	removePlayerCanJumpOnBody(player, body) {
		const index = player.data.canJumpOnBodies.indexOf(body);

		if (index !== -1) {
			player.data.canJumpOnBodies.splice(index, 1);
		}
	}

	initPlayer(player, initialXLocation, initialYLocation, playerCollisionGroup) {
		player.data.initialXLocation = initialXLocation;
		player.data.initialYLocation = initialYLocation;
		player.data.initialMass = PLAYER_MASS;
		player.data.currentMass = player.data.initialMass;
		player.data.initialGravity = PLAYER_GRAVITY_SCALE;
		player.data.currentGravity = player.data.initialGravity;
		player.data.velocityXOnMove = this.gameConfiguration.playerXVelocity();
		player.data.velocityYOnJump = this.gameConfiguration.playerYVelocity();
		player.data.doingDropShot = false;
		player.data.playerCollisionGroup = playerCollisionGroup;
		//Bonus
		player.data.moveModifier = () => {return 1;};
		player.data.isMoveReversed = false;
		player.data.isFrozen = false;
		player.data.canJump = true;
		player.data.alwaysJump = false;
		player.data.canJumpOnBodies = [];
		player.data.isInvincible = false;
		player.data.canActivateBonuses = true;

		this.initPlayerTexture(player);
		this.initPlayerPolygon(player);
		this.applyPlayerPolygon(player);
	}

	reinitPlayer(player) {
		this.initPlayerTexture(player);
		this.initPlayerPolygon(player);
		this.setupPlayerBody(player);
	}

	initPlayerTexture(player) {
		player.data.initialTextureKey = 'shape-' + this.playerShapeFromKey(player.data.key);
		player.data.currentTextureKey = player.data.initialTextureKey;
	}

	initPlayerPolygon(player) {
		player.data.initialPolygonObject = 'player-' + this.gameData.getPlayerPolygonFromKey(player.data.key);
		player.data.currentPolygonObject = player.data.initialPolygonObject;
		player.data.initialPolygonKey = NORMAL_SCALE_PHYSICS_DATA;
		player.data.currentPolygonKey = player.data.initialPolygonKey;
	}

	updatePlayerPolygon(player) {
		this.applyPlayerPolygon(player);
		this.applyPlayerPolygon(player); //Calling this twice fix a bug where sprite and body are not in sync
	}

	/**
	 * @private
	 * @param player
	 */
	applyPlayerPolygon(player) {
		this.engine.loadPolygon(player, player.data.currentPolygonKey, player.data.currentPolygonObject);
		this.setupPlayerBody(player);
	}

	setupPlayerBody(player) {
		this.engine.loadSpriteTexture(player, player.data.currentTextureKey);
		this.engine.setFixedRotation(player, true);
		this.engine.setMass(player, player.data.currentMass);

		if (this.engine.getIsFrozen(player)) {
			this.engine.setGravity(player, 0);
		} else {
			this.engine.setGravity(player, player.data.currentGravity);
		}

		this.collisions.setupPlayerBody(player);

		this.engine.addPlayerEye(
			player,
			player.data.playerCollisionGroup === this.collisions.hostPlayerCollisionGroup,
			player.data.currentPolygonKey,
			player.data.currentPolygonObject
		);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.gameSkin.createBallComponent(this.engine, initialXLocation, initialYLocation);

		this.ball.data.initialGravity = BALL_GRAVITY_SCALE;
		this.ball.data.currentGravity = this.ball.data.initialGravity;
		this.ball.data.isFrozen = false;

		this.ball.data.initialPolygonObject = 'ball';
		this.ball.data.currentPolygonObject = this.ball.data.initialPolygonObject;
		this.ball.data.initialPolygonKey = NORMAL_SCALE_PHYSICS_DATA;
		this.ball.data.currentPolygonKey = this.ball.data.initialPolygonKey;
		this.engine.loadPolygon(this.ball, this.ball.data.currentPolygonKey, this.ball.data.currentPolygonObject);

		this.setupBallBody();
	}

	setupBallBody() {
		this.engine.setFixedRotation(this.ball, true);
		this.engine.setDamping(this.ball, 0.1);

		if (this.engine.getIsFrozen(this.ball)) {
			this.engine.setGravity(this.ball, 0);
		} else {
			this.engine.setGravity(this.ball, this.ball.data.currentGravity);
		}

		this.collisions.setupBallBody(this.ball, this.hitBall, this.hitGround, this);
	}

	resumeOnTimerEnd() {
		this.gameBonus.reset();
		this.pauseGame();
		this.respawnSprites();

		if (this.gameData.hasGameStatusEndedWithAWinner()) {
			this.onGameEnd();
		} else if (this.gameIsOnGoing()) {
			this.gameBonus.resumeGame();
			this.startCountdownTimer();
		}
	}

	startCountdownTimer() {
		let timerDuration = 3;

		if (this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		//Calculate what's left
		let timerLeft = timerDuration - (this.serverNormalizedTime.getServerTimestamp() - this.gameData.lastPointAt) / 1000;
		if (timerLeft > timerDuration) {
			timerLeft = timerDuration;
		}

		if (timerLeft > 0) {
			this.countdownTimer = this.engine.createTimer(timerLeft, () => {
				this.countdownText.text = '';
				this.countdownTimer.stop();
				this.resumeGame();
			}, this);
			this.countdownTimer.start();
		} else {
			this.resumeGame();
		}
	}

	respawnSprites() {
		this.spawnPlayer(this.player1);
		this.spawnPlayer(this.player2);
		this.spawnBall();
	}

	spawnPlayer(player) {
		this.engine.spawn(player, player.data.initialXLocation, player.data.initialYLocation);
	}

	spawnBall() {
		const xBallPositionHostSide = this.gameConfiguration.ballInitialHostX();
		const xBallPositionClientSide = this.gameConfiguration.ballInitialClientX();
		let xBallPosition;

		switch (this.gameData.lastPointTaken) {
			case CLIENT_SIDE:
				xBallPosition = xBallPositionHostSide;
				break;
			case HOST_SIDE:
				xBallPosition = xBallPositionClientSide;
				break;
			default:
				//First ball is randomly given
				xBallPosition = Random.choice(
					[
						xBallPositionHostSide,
						xBallPositionClientSide
					]
				);
				break;
		}

		this.engine.spawn(this.ball, xBallPosition, this.gameConfiguration.ballInitialY());
	}

	updateGame() {
		this.gameStreamBundler.resetBundledStreams();

		this.engine.updatePlayerEye(this.player1, this.ball);
		this.engine.updatePlayerEye(this.player2, this.ball);

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserHost() && this.ball.data.isFrozen) {
			this.engine.setHorizontalSpeed(this.ball, 0);
			this.engine.setVerticalSpeed(this.ball, 0);
		}

		if (this.gameIsOnGoing()) {
			this.inputs();

			this.engine.constrainVelocity(this.ball, 1000);

			if (this.gameData.hasBonuses) {
				this.gameBonus.onUpdateGameOnGoing();
			}

			this.updateCountdown();

			if (this.gameData.isUserHost()) {
				this.sendBallPosition();
			}
		} else if (this.gameData.hasGameAborted()) {
			this.stopGame();
			this.onGameEnd();
		}

		this.gameStreamBundler.emitBundledStream(
			'sendBundledData-' + this.gameId,
			this.serverNormalizedTime.getServerTimestamp()
		);
	}

	updateCountdown() {
		if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
			let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
				scaleTo = 7;

			if (countdownText === 4 && this.gameData.numberMaximumPoints() > 1 && this.gameData.isMatchPoint()) {
				countdownText = 'MATCH POINT';
				scaleTo = 3;

				if (this.gameData.isDeucePoint()) {
					countdownText = 'DEUCE';
				}
			}

			countdownText = this.engine.updateText(this.countdownText, countdownText);

			//Zoom numbers
			if (countdownText !== this.lastCountdownNumber) {
				this.engine.animateScale(this.countdownText, scaleTo, scaleTo, 1, 1, 500);
				this.engine.animateSetOpacity(this.countdownText, 0, 1, 500);
			}

			this.lastCountdownNumber = countdownText;
		}
	}

	sendBallPosition() {
		let ballPositionData = this.engine.getPositionData(this.ball);
		let ballInterval = BALL_INTERVAL;

		if (JSON.stringify(this.lastBallPositionData) === JSON.stringify(ballPositionData)) {
			ballInterval *= 2;
		}
		this.lastBallPositionData = Object.assign({}, ballPositionData);

		this.lastBallUpdate = this.gameStreamBundler.addToBundledStreamsAtFrequence(
			this.lastBallUpdate,
			ballInterval,
			'moveClientBall',
			ballPositionData
		);
	}

	sendPlayerPosition(player) {
		let playerPositionData = this.engine.getPositionData(player);
		let playerInterval = PLAYER_INTERVAL;

		playerPositionData.isHost = this.gameData.isUserHost();
		playerPositionData.doingDropShot = player.data.doingDropShot;

		if (JSON.stringify(this.lastPlayerPositionData) === JSON.stringify(playerPositionData)) {
			playerInterval *= 2;
		}
		this.lastPlayerPositionData = Object.assign({}, playerPositionData);

		this.lastPlayerUpdate = this.gameStreamBundler.addToBundledStreamsAtFrequence(
			this.lastPlayerUpdate,
			playerInterval,
			'moveOppositePlayer',
			playerPositionData
		);
	}

	hitBall(ball, player) {
		this.onBallHitPlayer(ball.sprite, player.sprite, this.engine.getKey(player));
	}

	onBallHitPlayer(ball, player, playerKey) {
		if (this.isPlayerDoingDropShot(ball, player, playerKey)) {
			this.dropShotBallOnPlayerHit(ball);
		} else {
			if (this.isPlayerJumpingForward(player, playerKey) && this.isBallInFrontOfPlayer(ball, player, playerKey)) {
				this.smashBallOnPlayerHit(ball, playerKey);
			} else {
				if (!this.isBallBelowPlayer(ball, player)) {
					this.reboundBallOnPlayerHit(ball);
				}
			}
		}

		this.engine.constrainVelocity(ball, 1000);
	}

	isPlayerJumpingForward(player, playerKey) {
		return (
			Math.round(this.engine.getVerticalSpeed(player)) < 0 &&
			!this.engine.hasSurfaceTouchingPlayerBottom(player) &&
			(
				(playerKey === 'player1' && Math.round(this.engine.getHorizontalSpeed(player)) > 0) ||
				(playerKey === 'player2' && Math.round(this.engine.getHorizontalSpeed(player)) < 0)
			)
		);
	}

	isBallInFrontOfPlayer(ball, player, playerKey) {
		return (
			(playerKey === 'player1' && this.engine.getXPosition(player) < this.engine.getXPosition(ball)) ||
			(playerKey === 'player2' && this.engine.getXPosition(ball) < this.engine.getXPosition(player))
		);
	}

	isBallBelowPlayer(ball, player) {
		return (
			this.engine.getYPosition(ball) > this.engine.getYPosition(player) + (this.engine.getHeight(player) / 2)
		);
	}

	isPlayerDoingDropShot(ball, player) {
		return (
			player.data.doingDropShot && !this.engine.hasSurfaceTouchingPlayerBottom(player)
		);
	}

	dropShotBallOnPlayerHit(ball) {
		//Do not modify or add any velocity to the ball
	}

	smashBallOnPlayerHit(ball, playerKey) {
		//Ball direction should change if smashed the opposite way
		if (this.ballMovingTowardsPlayer(ball, playerKey)) {
			this.engine.setHorizontalSpeed(ball, -this.engine.getHorizontalSpeed(ball));
		}

		//Ball should go faster and down
		this.engine.setHorizontalSpeed(ball, this.engine.getHorizontalSpeed(ball) * 2);
		this.engine.setVerticalSpeed(ball, this.engine.getVerticalSpeed(ball) / 4);

		//Ball should always go down
		if (this.engine.getVerticalSpeed(ball) < 0) {
			this.engine.setVerticalSpeed(ball, -this.engine.getVerticalSpeed(ball));
		}
	}

	ballMovingTowardsPlayer(ball, playerKey) {
		return (
			(playerKey === 'player1' && this.engine.getHorizontalSpeed(ball) < 0) ||
			(playerKey === 'player2' && this.engine.getHorizontalSpeed(ball) > 0)
		);
	}

	reboundBallOnPlayerHit(ball) {
		this.engine.setVerticalSpeed(ball, BALL_VERTICAL_SPEED_ON_PLAYER_HIT);
	}

	canAddGamePoint(playerKey) {
		return (
			this.gameResumed === true &&
			this.gameData.isUserHost() &&
			this.getPlayerFromKey(playerKey) &&
			!this.getPlayerFromKey(playerKey).data.isInvincible
		);
	}

	hitGround(ball) {
		let playerKey;

		if (ball.x < this.gameConfiguration.width() / 2) {
			playerKey = 'player1';
		} else {
			playerKey = 'player2';
		}

		if (this.canAddGamePoint(playerKey)) {
			//Send to client
			this.gameStreamBundler.emitStream(
				'showBallHitPoint-' + this.gameId,
				{
					x: this.engine.getXPosition(this.ball),
					y: this.engine.getYPosition(this.ball),
					diameter: this.engine.getHeight(this.ball)
				},
				this.serverNormalizedTime.getServerTimestamp()
			);
			this.showBallHitPoint(
				this.engine.getXPosition(this.ball),
				this.engine.getYPosition(this.ball),
				this.engine.getHeight(this.ball)
			);

			this.addGamePoint(playerKey);
		}
	}

	addGamePoint(playerKey) {
		let pointSide;

		if (playerKey === 'player1') {
			pointSide = CLIENT_POINTS_COLUMN;
		} else {
			pointSide = HOST_POINTS_COLUMN;
		}

		this.gameResumed = false;

		Meteor.apply('addGamePoints', [this.gameId, pointSide], {noRetry: true}, () => {});
	}

	inputs() {
		const player = this.getCurrentPlayer();

		if (!player) {
			return false;
		}

		player.data.doingDropShot = false;

		if (player.data.isFrozen) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			const moveModifier = player.data.moveModifier();
			const moveReversal = (player.data.isMoveReversed ? -1 : 1);
			if (this.isLeftKeyDown()) {
				this.engine.setHorizontalSpeed(player, moveModifier * moveReversal * -player.data.velocityXOnMove);
			} else if (this.isRightKeyDown()) {
				this.engine.setHorizontalSpeed(player, moveModifier * moveReversal * player.data.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.engine.hasSurfaceTouchingPlayerBottom(player)) {
				if (player.data.alwaysJump || (this.isUpKeyDown() && player.data.canJump)) {
					this.engine.setVerticalSpeed(player, -player.data.velocityYOnJump);
				} else {
					this.engine.setVerticalSpeed(player, 0);
				}
			} else {
				player.data.doingDropShot = this.isDropShotKeyDown();
			}
		}

		this.sendPlayerPosition(player);

		return true;
	}

	isLeftKeyDown() {
		return this.deviceController.leftPressed();
	}

	isRightKeyDown() {
		return this.deviceController.rightPressed();
	}

	isUpKeyDown() {
		return this.deviceController.upPressed();
	}

	isDropShotKeyDown() {
		return this.deviceController.downPressed();
	}

	gameIsOnGoing() {
		return this.gameData.isGameStatusStarted();
	}

	moveOppositePlayer(data) {
		let player;

		if (data.isHost) {
			player = this.player1;
		} else {
			player = this.player2;
		}

		if (!this.gameInitiated || !player || !this.gameIsOnGoing()) {
			return;
		}

		player.data.doingDropShot = data.doingDropShot;

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		this.engine.interpolateMoveTo(player, serverNormalizedTimestamp, data, () => {return this.gameIsOnGoing()}, true);
	}

	moveClientBall(data) {
		if (!this.gameInitiated || !this.ball || !this.gameIsOnGoing()) {
			return;
		}

		let serverNormalizedTimestamp = this.serverNormalizedTime.getServerTimestamp();
		this.engine.interpolateMoveTo(this.ball, serverNormalizedTimestamp, data, () => {return this.gameIsOnGoing()});
	}

	createBonus(data) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.gameBonus.createBonus(data);
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.gameBonus.activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData);
	}

	moveClientBonus(bonusIdentifier, data) {
		if (!this.gameInitiated || !this.gameIsOnGoing()) {
			return;
		}

		this.gameBonus.moveClientBonus(bonusIdentifier, data);
	}

	pauseGame() {
		this.engine.freeze(this.ball);
	}

	stopGame() {
		this.engine.freeze(this.player1);
		this.engine.freeze(this.player2);
		this.engine.freeze(this.ball);

		this.gameBonus.onGameStop();
	}

	resumeGame() {
		this.engine.unfreeze(this.ball);
		this.gameResumed = true;
	}

	cheer(forHost) {
		if (!this.gameInitiated) {
			return;
		}

		this.gameSkin.cheer(
			this.engine,
			forHost,
			forHost ? 0 : this.gameConfiguration.width(),
			this.gameConfiguration.height() * 0.10 + 25
		);
	}

	showBallHitPoint(x, y, diameter) {
		this.engine.showBallHitPoint(x, y, diameter);
	}

	shakeLevel() {
		this.levelComponents.shake();
	}
};
