import {Meteor} from 'meteor/meteor';
import {Random} from 'meteor/random';
import {Session} from 'meteor/session';
import {
	GAME_X_SIZE,
	GAME_Y_SIZE,
	GAME_GROUND_HEIGHT,
	GAME_NET_HEIGHT,
	GAME_NET_THICKNESS,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	PLAYER_INITIAL_LOCATION,
	PLAYER_VELOCITY_X_ON_MOVE,
	PLAYER_VELOCITY_Y_ON_JUMP,
	PLAYER_MASS,
	PLAYER_GRAVITY_SCALE,
	BALL_RADIUS,
	BALL_DISTANCE_FROM_GROUND,
	BALL_VERTICAL_SPEED_ON_PLAYER_HIT,
	BALL_GRAVITY_SCALE,
	NORMAL_SCALE_PHYSICS_DATA,
	LAST_POINT_TAKEN_CLIENT,
	LAST_POINT_TAKEN_HOST,
	CLIENT_POINTS_COLUMN,
	HOST_POINTS_COLUMN
} from '/imports/api/games/constants.js';
import {PLAYER_INTERVAL, BALL_INTERVAL} from '/imports/api/games/emissionConstants.js';
import GameBonus from '/imports/api/games/client/GameBonus.js';

export default class Game {

	/**
	 * @param {string} gameId
	 * @param {PhaserEngine} engine
	 * @param {GameData} gameData
	 * @param {GameStreamBundler} gameStreamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(gameId, engine, gameData, gameStreamBundler, serverNormalizedTime) {
		this.gameId = gameId;
		this.engine = engine;
		this.gameData = gameData;
		this.gameStreamBundler = gameStreamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.xSize = GAME_X_SIZE;
		this.ySize = GAME_Y_SIZE;
		this.groundHeight = GAME_GROUND_HEIGHT;
		this.lastBallPositionData = {};
		this.lastPlayerPositionData = {};
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.gameResumed = false;
		this.gameInitiated = false;
		this.gameStreamBundler.resetBundledStreams();

		this.gameBonus = new GameBonus(this, this.engine, this.gameData, this.gameStreamBundler, this.serverNormalizedTime);
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

	start() {
		this.engine.start(
			this.xSize, this.ySize, 'gameContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.shakeLevel();
			this.resumeOnTimerEnd();
		}
	}

	stop() {
		this.engine.stop();
	}

	onGameEnd() {
		this.engine.onGameEnd();
		Session.set('userCurrentlyPlaying', false);
	}

	preloadGame() {
		this.engine.preloadGame();

		this.engine.loadImage('player1', 'assets/player-' + this.gameData.getPlayerShapeFromKey('player1') + '.png');
		this.engine.loadImage('player2', 'assets/player-' + this.gameData.getPlayerShapeFromKey('player2') + '.png');
		this.engine.loadImage('ball', 'assets/ball.png');
		this.engine.loadImage('net', 'assets/net.png');
		this.engine.loadImage('ground', 'assets/ground.png');
		this.engine.loadSpriteSheet('confettis', 'assets/confettis.png', 10, 10);

		this.engine.loadImage('delimiter', 'assets/clear.png');
		this.engine.loadData(NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json');

		this.gameBonus.preload();
	}

	createGame() {
		this.createComponents();
		this.gameBonus.createComponents();

		if (this.getCurrentPlayer()) {
			this.engine.addKeyControllers();
			Session.set('userCurrentlyPlaying', true);
		}

		this.gameInitiated = true;

		this.resumeOnTimerEnd();
	}

	createComponents() {
		let initialXLocation = PLAYER_INITIAL_LOCATION;
		const initialYLocation = this.ySize - this.groundHeight - (PLAYER_HEIGHT / 2);

		this.engine.createGame();

		/**
		 * Collision groups and materials
		 */
		this.createCollisionGroupsAndMaterials();

		/**
		 * Player 1
		 */
		this.player1 = this.engine.addSprite(initialXLocation, initialYLocation, 'player1', undefined);
		this.createPlayer(this.player1, initialXLocation, initialYLocation, 'player1');

		/**
		 * Player 2
		 */
		initialXLocation = this.xSize - PLAYER_INITIAL_LOCATION;
		this.player2 = this.engine.addSprite(initialXLocation, initialYLocation, 'player2', undefined);
		this.createPlayer(this.player2, initialXLocation, initialYLocation, 'player2');

		/**
		 * Ball
		 */
		this.createBall(PLAYER_INITIAL_LOCATION, this.ySize - this.groundHeight - BALL_DISTANCE_FROM_GROUND);

		/**
		 * Level
		 */
		this.loadLevel();

		/**
		 * Countdown text
		 */
		this.countdownText = this.engine.addText(this.engine.getCenterX(), this.engine.getCenterY(), '', {
			font: "75px 'Oxygen Mono', sans-serif",
			fill: '#363636',
			align: 'center'
		});
	}

	createCollisionGroupsAndMaterials() {
		this.playerCollisionGroup = this.engine.createCollisionGroup();
		this.ballCollisionGroup = this.engine.createCollisionGroup();
		this.playerDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.groundHitDelimiterCollisionGroup = this.engine.createCollisionGroup();

		this.playerMaterial = this.engine.createMaterial('player');
		this.ballMaterial = this.engine.createMaterial('ball');
		this.playerDelimiterMaterial = this.engine.createMaterial('netPlayerDelimiter');
		this.netDelimiterMaterial = this.engine.createMaterial('netDelimiter');
		this.groundDelimiterMaterial = this.engine.createMaterial('groundDelimiter');

		this.engine.initWorldContactMaterial();

		this.engine.createWorldContactMaterial(this.ballMaterial, {restitution: 1});
		this.engine.createContactMaterial(this.ballMaterial, this.groundDelimiterMaterial, {restitution: 1});

		this.engine.createWorldContactMaterial(this.playerMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});
		this.engine.createContactMaterial(this.playerMaterial, this.playerDelimiterMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});

		this.gameBonus.createCollisionGroupsAndMaterials();
	}

	createContactMaterialWithNetDelimiter(material, config) {
		this.engine.createContactMaterial(material, this.netDelimiterMaterial, config);
	}

	createContactMaterialWithGroundDelimiter(material, config) {
		this.engine.createContactMaterial(material, this.groundDelimiterMaterial, config);
	}

	collidesWithPlayerDelimiter(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.playerDelimiterCollisionGroup, callback, scope);
	}

	collidesWithNetHitDelimiter(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.netHitDelimiterCollisionGroup, callback, scope);
	}

	collidesWithGroundHitDelimiter(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.groundHitDelimiterCollisionGroup, callback, scope);
	}

	collidesWithPlayer(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.playerCollisionGroup, callback, scope);
	}

	collidesWithBall(sprite, callback, scope) {
		this.engine.collidesWith(sprite, this.ballCollisionGroup, callback, scope);
	}

	createPlayer(player, initialXLocation, initialYLocation, playerKey) {
		player.initialXLocation = initialXLocation;
		player.initialYLocation = initialYLocation;
		player.initialMass = PLAYER_MASS;
		player.initialGravity = PLAYER_GRAVITY_SCALE;
		player.velocityXOnMove = PLAYER_VELOCITY_X_ON_MOVE;
		player.velocityYOnJump = PLAYER_VELOCITY_Y_ON_JUMP;
		player.doingDropShot = false;
		//These are related to bonus but managed in this class
		player.moveModifier = 1;
		player.isFrozen = false;
		player.canJump = true;
		player.alwaysJump = false;

		this.gameBonus.initPlayerProperties(player);

		player.polygonObject = 'player-' + this.gameData.getPlayerShapeFromKey(playerKey);
		this.engine.loadPolygon(player, NORMAL_SCALE_PHYSICS_DATA, player.polygonObject);

		this.setupPlayerBody(player);
	}

	setupPlayerBody(player) {
		this.engine.setFixedRotation(player, true);
		this.engine.setMass(player, player.initialMass);

		if (player.isFrozen) {
			this.engine.setGravity(player, 0);
		} else {
			this.engine.setGravity(player, player.initialGravity);
		}

		this.engine.setMaterial(player, this.playerMaterial);
		this.engine.setCollisionGroup(player, this.playerCollisionGroup);

		this.collidesWithPlayerDelimiter(player);
		this.collidesWithBall(player);
		this.gameBonus.collidesWithBonus(player);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.engine.addSprite(initialXLocation, initialYLocation, 'ball', undefined);

		this.ball.initialGravity = BALL_GRAVITY_SCALE;
		this.ball.isFrozen = false;

		this.ball.polygonObject = 'ball';
		this.engine.loadPolygon(this.ball, NORMAL_SCALE_PHYSICS_DATA, 'ball');

		this.setupBallBody();
	}

	setupBallBody() {
		this.engine.setFixedRotation(this.ball, true);
		if (this.ball.isFrozen) {
			this.engine.setGravity(this.ball, 0);
		} else {
			this.engine.setGravity(this.ball, this.ball.initialGravity);
		}
		this.engine.setDamping(this.ball, 0.1);
		this.engine.setMaterial(this.ball, this.ballMaterial);
		this.engine.setCollisionGroup(this.ball, this.ballCollisionGroup);

		this.collidesWithPlayer(this.ball, this.hitBall, this);
		this.collidesWithNetHitDelimiter(this.ball);
		this.collidesWithGroundHitDelimiter(this.ball, this.hitGround, this);
		this.gameBonus.collidesWithBonus(this.ball);
	}

	loadLevel() {
		this.level = this.engine.addGroup();

		this.loadGroundLevel();

		this.loadNetLevel();
	}

	loadGroundLevel() {
		let groupItem;

		/**
		 * Look
		 */
		this.engine.addTileSprite(
			0,
			this.ySize - this.groundHeight,
			this.xSize,
			this.groundHeight,
			'ground',
			this.level
		);

		/**
		 * Player delimiter
		 */
		groupItem = this.engine.addTileSprite(
			this.xSize / 2,
			this.ySize - (this.groundHeight / 2),
			this.xSize,
			this.groundHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.playerDelimiterCollisionGroup);
		this.collidesWithPlayer(groupItem);

		/**
		 * Ball hit delimiter
		 */
		groupItem = this.engine.addTileSprite(
			this.xSize / 2,
			this.ySize - (this.groundHeight / 2),
			this.xSize,
			this.groundHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.groundDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.groundHitDelimiterCollisionGroup);
		this.collidesWithBall(groupItem);
		this.gameBonus.collidesWithBonus(groupItem);
	}

	loadNetLevel() {
		let groupItem;

		/**
		 * Look
		 */
		this.engine.addTileSprite(
			(this.xSize / 2) - (GAME_NET_THICKNESS / 2),
			this.ySize - this.groundHeight - GAME_NET_HEIGHT,
			GAME_NET_THICKNESS,
			GAME_NET_HEIGHT,
			'net',
			this.level
		);

		/**
		 * Player delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 2),
			(this.ySize / 2),
			GAME_NET_THICKNESS,
			this.ySize,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.playerDelimiterCollisionGroup);
		this.collidesWithPlayer(groupItem);

		/**
		 * Ball hit delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 2),
			this.ySize - this.groundHeight - (GAME_NET_HEIGHT / 2),
			GAME_NET_THICKNESS,
			GAME_NET_HEIGHT,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.netDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.netHitDelimiterCollisionGroup);
		this.collidesWithBall(groupItem);
		this.gameBonus.collidesWithBonus(groupItem);
	}

	resumeOnTimerEnd() {
		this.gameBonus.reset();
		this.pauseGame();
		this.respawnSprites();

		if (this.gameData.isGameStatusFinished()) {
			this.onGameEnd();
		} else if (this.gameData.isGameStatusStarted()) {
			this.gameBonus.resumeGame();
			this.startCountdownTimer();
		}
	}

	startCountdownTimer() {
		let timerDuration = 3;

		if (this.gameData.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		//Calculate what's left
		let timerLeft = timerDuration - (this.serverNormalizedTime.getServerNormalizedTimestamp() - this.gameData.lastPointAt) / 1000;
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
		this.engine.spawn(player, player.initialXLocation, player.initialYLocation);
	}

	spawnBall() {
		const xBallPositionHostSide = PLAYER_INITIAL_LOCATION + (PLAYER_WIDTH / 4) + (BALL_RADIUS);
		const xBallPositionClientSide = this.xSize - PLAYER_INITIAL_LOCATION - (PLAYER_WIDTH / 4) - (BALL_RADIUS);
		let xBallPosition;

		switch (this.gameData.lastPointTaken) {
			case LAST_POINT_TAKEN_CLIENT:
				xBallPosition = xBallPositionHostSide;
				break;
			case LAST_POINT_TAKEN_HOST:
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

		this.engine.spawn(this.ball, xBallPosition, this.ySize - this.groundHeight - BALL_DISTANCE_FROM_GROUND);
	}

	updateGame() {
		this.gameStreamBundler.resetBundledStreams();

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserHost() && this.ball.isFrozen) {
			this.engine.setHorizontalSpeed(this.ball, 0);
			this.engine.setVerticalSpeed(this.ball, 0);
		}

		if (this.gameData.isGameStatusStarted()) {
			this.inputs();
			this.gameBonus.onUpdateGameOnGoing();

			this.updateCountdown();

			if (this.gameData.isUserHost()) {
				this.sendBallPosition();
			}
		} else if (this.gameData.isGameStatusTimeout()) {
			this.stopGame();
			this.onGameEnd();
		}

		this.gameStreamBundler.emitBundledStream('sendBundledData-' + this.gameId);
	}

	updateCountdown() {
		if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
			let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
				scaleTo = 7;

			if (countdownText === 4 && this.gameData.isMatchPoint()) {
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
		ballPositionData['timestamp'] = this.serverNormalizedTime.getServerNormalizedTimestamp();

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
		playerPositionData.doingDropShot = player.doingDropShot;

		if (JSON.stringify(this.lastPlayerPositionData) === JSON.stringify(playerPositionData)) {
			playerInterval *= 2;
		}
		this.lastPlayerPositionData = Object.assign({}, playerPositionData);
		playerPositionData['timestamp'] = this.serverNormalizedTime.getServerNormalizedTimestamp();

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
		if (this.isPlayerJumpingForward(player, playerKey) && this.isBallInFrontOfPlayer(ball, player, playerKey)) {
			if (this.isPlayerDoingDropShot(ball, player, playerKey)) {
				this.dropShotBallOnPlayerHit(ball);
			} else {
				this.smashBallOnPlayerHit(ball, playerKey);
			}
		} else {
			if (!this.isBallBelowPlayer(ball, player)) {
				if (this.isPlayerDoingDropShot(ball, player, playerKey)) {
					this.dropShotBallOnPlayerHit(ball);
				} else {
					this.reboundBallOnPlayerHit(ball);
				}
			}
		}

		this.engine.constrainVelocity(ball, 1000);
	}

	isPlayerJumpingForward(player, playerKey) {
		return (
			Math.round(this.engine.getVerticalSpeed(player)) < 0 &&
			!this.isPlayerAtGroundLevel(player) &&
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
			this.engine.getYPosition(ball) > this.engine.getYPosition(player) + (PLAYER_HEIGHT / 2)
		);
	}

	isPlayerDoingDropShot(ball, player, playerKey) {
		return (
			player.doingDropShot && this.isBallInFrontOfPlayer(ball, player, playerKey) && !this.isPlayerAtGroundLevel(player)
		);
	}

	dropShotBallOnPlayerHit(ball) {
		//Do not modify or add any velocity to the ball
	}

	smashBallOnPlayerHit(ball, playerKey) {
		//Ball direction should change if smashed the opposite way
		if (
			(playerKey === 'player1' && this.engine.getHorizontalSpeed(ball) < 0) ||
			(playerKey === 'player2' && this.engine.getHorizontalSpeed(ball) > 0)
		) {
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

	reboundBallOnPlayerHit(ball) {
		this.engine.setVerticalSpeed(ball, BALL_VERTICAL_SPEED_ON_PLAYER_HIT);
	}

	hitGround(ball) {
		if (this.gameData.isUserHost() && this.gameResumed === true) {
			let playerKey;
			let pointSide;

			if (ball.x < this.xSize / 2) {
				playerKey = 'player1';
				pointSide = CLIENT_POINTS_COLUMN;
			} else {
				playerKey = 'player2';
				pointSide = HOST_POINTS_COLUMN;
			}

			if (this.gameBonus.isPlayerInvincible(this.getPlayerFromKey(playerKey))) {
				return;
			}

			this.gameResumed = false;
			Meteor.apply('addGamePoints', [this.gameId, pointSide], {noRetry: true}, () => {});
		}
	}

	inputs() {
		const player = this.getCurrentPlayer();

		if (!player) {
			return false;
		}

		player.doingDropShot = false;

		if (player.isFrozen) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			if (this.isLeftKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.moveModifier * -player.velocityXOnMove);
			} else if (this.isRightKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.moveModifier * player.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.isPlayerAtGroundLevel(player)) {
				if (player.alwaysJump || (this.isUpKeyDown() && player.canJump)) {
					this.engine.setVerticalSpeed(player, -player.velocityYOnJump);
				} else {
					this.engine.setVerticalSpeed(player, 0);
				}
			} else {
				player.doingDropShot = this.isDropShotKeyDown();
			}
		}

		this.sendPlayerPosition(player);

		return true;
	}

	isLeftKeyDown() {
		return (
			this.engine.isInputSetup() &&
			(
				this.engine.isLeftKeyDown() || this.engine.isAKeyDown()
			)
		);
	}

	isRightKeyDown() {
		return (
			this.engine.isInputSetup() &&
			(
				this.engine.isRightKeyDown() || this.engine.isDKeyDown()
			)
		);
	}

	isUpKeyDown() {
		return (
			this.engine.isInputSetup() &&
			(
				this.engine.isUpKeyDown() || this.engine.isWKeyDown()
			)
		);
	}

	isDropShotKeyDown() {
		return (
			this.engine.isInputSetup() &&
			(
				this.engine.isDownKeyDown() || this.engine.isSKeyDown() || this.engine.isSpacebarKeyDown()
			)
		);
	}

	isPlayerAtGroundLevel(player) {
		return (player.bottom >= this.ySize - this.groundHeight);
	}

	moveOppositePlayer(data) {
		let player;

		if (data.isHost) {
			player = this.player1;
		} else {
			player = this.player2;
		}

		if (!this.gameInitiated || !player || !this.gameData.isGameStatusStarted()) {
			return;
		}

		player.doingDropShot = data.doingDropShot;

		data = this.engine.interpolateFromTimestamp(this.serverNormalizedTime.getServerNormalizedTimestampForInterpolation(), player, data);

		this.engine.move(player, data);
	}

	moveClientBall(data) {
		if (!this.gameInitiated || !this.ball || !this.gameData.isGameStatusStarted()) {
			return;
		}

		data = this.engine.interpolateFromTimestamp(this.serverNormalizedTime.getServerNormalizedTimestampForInterpolation(), this.ball, data);

		this.engine.move(this.ball, data);
	}

	createBonus(data) {
		if (!this.gameInitiated || !this.gameData.isGameStatusStarted()) {
			return;
		}

		this.gameBonus.createBonus(data);
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt) {
		if (!this.gameInitiated || !this.gameData.isGameStatusStarted()) {
			return;
		}

		this.gameBonus.activateBonus(bonusIdentifier, playerKey, activatedAt);
	}

	moveClientBonus(bonusIdentifier, data) {
		if (!this.gameInitiated || !this.gameData.isGameStatusStarted()) {
			return;
		}

		this.gameBonus.moveClientBonus(bonusIdentifier, data);
	}

	pauseGame() {
		this.engine.freeze(this.ball);
		this.ball.isFrozen = true;
	}

	stopGame() {
		this.engine.freeze(this.player1);
		this.engine.freeze(this.player2);
		this.engine.freeze(this.ball);
		this.ball.isFrozen = true;

		this.gameBonus.onGameStop();
	}

	resumeGame() {
		this.engine.unfreeze(this.ball);
		this.ball.isFrozen = false;
		this.gameResumed = true;
	}

	cheer(forHost) {
		this.engine.emitParticules(
			forHost ? 0 : this.xSize,
			this.ySize * 0.10 + 28,
			(forHost ? 1 : -1) * 50,
			(forHost ? 1 : -1) * 250,
			25,
			150,
			'confettis',
			(forHost ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9]),
			50,
			false,
			3000,
			0,
			500
		);
	}

	shakeLevel() {
		this.engine.shake(this.level, 5, 20, 0, 0);
	}

};
