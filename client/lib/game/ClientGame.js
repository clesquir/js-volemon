import PhaserEngine from '/imports/game/engine/client/PhaserEngine.js';
import BonusFactory from '/imports/game/BonusFactory.js';
import {
	isGameStatusStarted,
	isGameStatusTimeout,
	isGameStatusFinished
} from '/imports/game/utils.js';
import { getRandomInt } from '/client/lib/utils.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Config } from '/imports/lib/config.js';
import { Constants } from '/imports/lib/constants.js';
import { getUTCTimeStamp } from '/imports/lib/utils.js';

export default class ClientGame {

	constructor(gameId) {
		this.gameId = gameId;
		this.engine = new PhaserEngine();
		this.xSize = Constants.GAME_X_SIZE;
		this.ySize = Constants.GAME_Y_SIZE;
		this.groundHeight = Constants.GAME_GROUND_HEIGHT;
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.lastBonusUpdate = 0;
		this.gameResumed = false;
		this.lastBonusCreated = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
		this.bundledStreamsToEmit = {};
		this.bonuses = [];
		this.activeBonuses = [];
		this.serverOffset = TimeSync.serverOffset();
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		let player;

		if (playerKey == 'player1') {
			player = this.hostPlayer;
		} else {
			player = this.clientPlayer;
		}

		if (!player) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	isUserHost() {
		return (this.gameCreatedBy === Meteor.userId() && this.currentPlayer);
	}

	isUserClient() {
		return (this.gameCreatedBy !== Meteor.userId() && this.currentPlayer);
	}

	isGameOnGoing() {
		return isGameStatusStarted(this.gameStatus);
	}

	isGameTimeOut() {
		return isGameStatusTimeout(this.gameStatus);
	}

	isGameFinished() {
		return isGameStatusFinished(this.gameStatus);
	}

	isMatchPoint() {
		let matchPoint = Constants.MAXIMUM_POINTS - 1;

		return (
			this.gameHostPoints == matchPoint ||
			this.gameClientPoints == matchPoint
		);
	}

	isDeucePoint() {
		let matchPoint = Constants.MAXIMUM_POINTS - 1;

		return (
			this.gameHostPoints == matchPoint &&
			this.gameClientPoints == matchPoint
		);
	}

	getCurrentPlayer() {
		var player;

		if (this.isUserHost()) {
			player = this.player1;
		} else if (this.isUserClient()) {
			player = this.player2;
		}

		return player;
	}

	getPlayerFromKey(playerKey) {
		if (playerKey == 'player1') {
			return this.player1;
		} else if (playerKey == 'player2') {
			return this.player2;
		} else {
			return null;
		}
	}

	getBonusFromIdentifier(bonusIdentifier) {
		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				return bonus;
			}
		}

		return null;
	}

	getPolygonKeyFromScale(scale) {
		var polygonKey = null;

		switch (scale) {
			case Constants.NORMAL_SCALE_BONUS:
				polygonKey = Constants.NORMAL_SCALE_PHYSICS_DATA;
				break;
			case Constants.SMALL_SCALE_PLAYER_BONUS:
			case Constants.SMALL_SCALE_BALL_BONUS:
				polygonKey = Constants.SMALL_SCALE_PHYSICS_DATA;
				break;
			case Constants.BIG_SCALE_BONUS:
				polygonKey = Constants.BIG_SCALE_PHYSICS_DATA;
				break;
		}

		return polygonKey;
	}

	getServerNormalizedTimestamp() {
		return getUTCTimeStamp() + this.serverOffset;
	}

	start() {
		this.initGame();

		this.engine.start(
			this.xSize, this.ySize, 'gameContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
	}

	initGame() {
		let game = this.fetchGame();

		this.gameCreatedBy = game.createdBy;
		this.gameHasBonuses = game.hasBonuses;

		this.updatePoints(game);
		this.updateLastPointTaken(game);
		this.updateStatus(game);
		this.updateActiveBonuses(game);

		this.initPlayers();
	}

	initPlayers() {
		let players = Players.find({gameId: this.gameId});

		this.currentPlayer = null;
		this.hostPlayer = null;
		this.clientPlayer = null;

		players.forEach((player) => {
			if (player.userId == Meteor.userId()) {
				this.currentPlayer = player;
			}

			if (player.userId == this.gameCreatedBy) {
				this.hostPlayer = player;
			} else {
				this.clientPlayer = player;
			}
		});
	}

	fetchGame() {
		return Games.findOne({_id: this.gameId});
	}

	onStatusChange() {
		let game = this.fetchGame();

		this.updateStatus(game);
	}

	onActiveBonusesChange() {
		let game = this.fetchGame();

		this.updateActiveBonuses(game);
	}

	onPointTaken() {
		this.shakeLevel();
		this.resumeOnTimerEnd();
	}

	updatePoints(game) {
		this.gameHostPoints = game.hostPoints;
		this.gameClientPoints = game.clientPoints;
	}

	updateLastPointTaken(game) {
		this.gameLastPointTaken = game.lastPointTaken;
	}

	updateStatus(game) {
		this.gameStatus = game.status;
	}

	updateActiveBonuses(game) {
		this.gameActiveBonuses = game.activeBonuses;
	}

	stop() {
		this.engine.stop();
	}

	onGameEnd() {
		this.engine.onGameEnd();
	}

	preloadGame() {
		this.engine.preloadGame();

		this.engine.loadImage('player1', 'assets/player-' + this.getPlayerShapeFromKey('player1') + '.png');
		this.engine.loadImage('player2', 'assets/player-' + this.getPlayerShapeFromKey('player2') + '.png');
		this.engine.loadImage('ball', 'assets/ball.png');
		this.engine.loadImage('net', 'assets/net.png');
		this.engine.loadImage('ground', 'assets/ground.png');
		this.engine.loadImage('cloud', 'assets/cloud.png');

		this.engine.loadImage('delimiter', 'assets/clear.png');
		this.engine.loadImage('bonus-environment', 'assets/bonus-environment.png');
		this.engine.loadImage('bonus-environment-positive', 'assets/bonus-environment-positive.png');
		this.engine.loadImage('bonus-environment-negative', 'assets/bonus-environment-negative.png');
		this.engine.loadImage('bonus-target', 'assets/bonus-target.png');
		this.engine.loadImage('bonus-target-positive', 'assets/bonus-target-positive.png');
		this.engine.loadImage('bonus-target-negative', 'assets/bonus-target-negative.png');
		this.engine.loadData(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json');
	}

	createGame() {
		var initialXLocation = Config.playerInitialLocation,
			initialYLocation = this.ySize - this.groundHeight - (Constants.PLAYER_HEIGHT / 2);

		this.engine.createGame();

		/**
		 * Collision groups and materials
		 */
		this.createCollisionGroupsAndMaterials();

		/**
		 * Player 1
		 */
		this.player1 = this.engine.addSprite(initialXLocation, initialYLocation, 'player1');
		this.createPlayer(this.player1, initialXLocation, initialYLocation, 'player1');

		/**
		 * Player 2
		 */
		initialXLocation = this.xSize - Config.playerInitialLocation;
		this.player2 = this.engine.addSprite(initialXLocation, initialYLocation, 'player2');
		this.createPlayer(this.player2, initialXLocation, initialYLocation, 'player2');

		/**
		 * Ball
		 */
		this.createBall(Config.playerInitialLocation, this.ySize - this.groundHeight - Config.ballDistanceFromGround);

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

		this.bonusesGroup = this.engine.addGroup();

		this.engine.addKeyControllers();

		this.resumeOnTimerEnd();
	}

	createCollisionGroupsAndMaterials() {
		this.playerCollisionGroup = this.engine.createCollisionGroup();
		this.ballCollisionGroup = this.engine.createCollisionGroup();
		this.bonusCollisionGroup = this.engine.createCollisionGroup();
		this.playerDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.groundHitDelimiterCollisionGroup = this.engine.createCollisionGroup();

		this.playerMaterial = this.engine.createMaterial('player');
		this.ballMaterial = this.engine.createMaterial('ball');
		this.bonusMaterial = this.engine.createMaterial('bonus');
		this.playerDelimiterMaterial = this.engine.createMaterial('netPlayerDelimiter');
		this.netDelimiterMaterial = this.engine.createMaterial('netDelimiter');
		this.groundDelimiterMaterial = this.engine.createMaterial('groundDelimiter');

		this.engine.updateContactMaterials(
			this.ballMaterial, this.playerMaterial, this.playerDelimiterMaterial,
			this.bonusMaterial, this.netDelimiterMaterial, this.groundDelimiterMaterial
		);
	}

	createPlayer(player, initialXLocation, initialYLocation, playerKey) {
		player.initialXLocation = initialXLocation;
		player.initialYLocation = initialYLocation;
		player.initialMass = Constants.PLAYER_MASS;
		player.initialGravity = Constants.PLAYER_GRAVITY_SCALE;
		player.activeGravity = null;
		player.leftMoveModifier = -1;
		player.rightMoveModifier = 1;
		player.velocityXOnMove = Config.playerVelocityXOnMove;
		player.velocityYOnJump = Config.playerVelocityYOnJump;
		player.isFrozen = false;
		player.doingDropShot = false;

		player.polygonObject = 'player-' + this.getPlayerShapeFromKey(playerKey);
		this.engine.loadPolygon(player, Constants.NORMAL_SCALE_PHYSICS_DATA, player.polygonObject);

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

		this.engine.collidesWith(player, this.playerDelimiterCollisionGroup);
		this.engine.collidesWith(player, this.ballCollisionGroup);
		this.engine.collidesWith(player, this.bonusCollisionGroup);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.engine.addSprite(initialXLocation, initialYLocation, 'ball');

		this.ball.initialGravity = Constants.BALL_GRAVITY_SCALE;
		this.ball.isFrozen = false;

		this.ball.polygonObject = 'ball';
		this.engine.loadPolygon(this.ball, Constants.NORMAL_SCALE_PHYSICS_DATA, 'ball');

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

		this.engine.collidesWith(this.ball, this.playerCollisionGroup, this.hitBall, this);
		this.engine.collidesWith(this.ball, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(this.ball, this.groundHitDelimiterCollisionGroup, this.hitGround, this);
		this.engine.collidesWith(this.ball, this.bonusCollisionGroup);
	}

	loadLevel() {
		this.level = this.engine.addGroup();

		this.loadGroundLevel();

		this.loadNetLevel();
	}

	loadGroundLevel() {
		var groupItem;

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
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

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
		this.engine.collidesWith(groupItem, this.ballCollisionGroup);
		this.engine.collidesWith(groupItem, this.bonusCollisionGroup);
	}

	loadNetLevel() {
		var groupItem;

		/**
		 * Look
		 */
		this.engine.addTileSprite(
			(this.xSize / 2) - (Config.netThickness / 2),
			this.ySize - this.groundHeight - Config.netHeight,
			Config.netThickness,
			Config.netHeight,
			'net',
			this.level
		);

		/**
		 * Player delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 2),
			(this.ySize / 2),
			Config.netThickness,
			this.ySize,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.playerDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Ball hit delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 2),
			this.ySize - this.groundHeight - (Config.netHeight / 2),
			Config.netThickness,
			Config.netHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.netDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.ballCollisionGroup);
		this.engine.collidesWith(groupItem, this.bonusCollisionGroup);
	}

	resumeOnTimerEnd() {
		let game = this.fetchGame();

		this.updatePoints(game);
		this.updateLastPointTaken(game);
		this.updateStatus(game);
		this.updateActiveBonuses(game);

		this.resetAllBonuses();
		this.pauseGame();
		this.respawnSprites();

		if (this.isGameFinished()) {
			this.onGameEnd();
		} else if (this.isGameOnGoing()) {
			this.startCountdownTimer();
			this.regenerateLastBonusCreatedAndFrequenceTime();
			this.lastGameRespawn = getUTCTimeStamp();
		}
	}

	startCountdownTimer() {
		var timerDuration = 3;

		if (this.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		this.countdownTimer = this.engine.createTimer(timerDuration, this.resumeGame, this);
		this.countdownTimer.start();
	}

	respawnSprites() {
		this.spawnPlayer(this.player1);
		this.spawnPlayer(this.player2);
		this.spawnBall();
	}

	spawnPlayer(player) {
		this.engine.animateScale(player, 1, 1, 0, 0, 300);
		this.engine.spawn(player, player.initialXLocation, player.initialYLocation);
	}

	spawnBall() {
		var xBallPositionHostSide = Config.playerInitialLocation + (Constants.PLAYER_WIDTH / 4) + (Constants.BALL_RADIUS),
			xBallPositionClientSide = this.xSize - Config.playerInitialLocation - (Constants.PLAYER_WIDTH / 4) - (Constants.BALL_RADIUS),
			xBallPosition;

		switch (this.gameLastPointTaken) {
			case Constants.LAST_POINT_TAKEN_CLIENT:
				xBallPosition = xBallPositionHostSide;
				break;
			case Constants.LAST_POINT_TAKEN_HOST:
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

		this.engine.spawn(this.ball, xBallPosition, this.ySize - this.groundHeight - Config.ballDistanceFromGround);
	}

	updateGame() {
		//Reset bundled streams
		this.bundledStreamsToEmit = {};

		//Do not allow ball movement if it is frozen
		if (this.isUserHost() && this.ball.isFrozen) {
			this.engine.setHorizontalSpeed(this.ball, 0);
			this.engine.setVerticalSpeed(this.ball, 0);
		}

		if (this.isGameOnGoing()) {
			this.inputs();
			this.checkBonuses();
			this.updatePlayerBonuses();

			this.updateCountdown();

			//Send ball position to database only if it has changed
			if (this.isUserHost()) {
				this.sendBallPosition();

				if (this.gameHasBonuses) {
					this.createBonusIfTimeHasElapsed();
					this.sendBonusesPosition();
				}
			}
		} else if (this.isGameTimeOut()) {
			this.stopGame();
			this.onGameEnd();
		}

		//Send bundled streams if there is streams to send
		if (this.bundledStreamsToEmit != {}) {
			ClientStream.emit('sendBundledData-' + this.gameId, this.bundledStreamsToEmit);
		}
	}

	addToBundledStreamsAtFrequence(lastCallTime, frequenceTime, streamName, argumentsToBundleWith) {
		if (getUTCTimeStamp() - lastCallTime >= frequenceTime) {
			this.bundledStreamsToEmit[streamName] = argumentsToBundleWith;

			lastCallTime = getUTCTimeStamp();
		}

		return lastCallTime;
	}

	updatePlayerBonuses() {
		this.bonusesGroup.removeAll(true);

		let padding = 5;
		let player1Count = 0;
		let player2Count = 0;

		for (let activeBonus of this.gameActiveBonuses) {
			let bonus = BonusFactory.getInstance(activeBonus.bonusClass, this);

			switch (activeBonus.targetPlayerKey) {
				case 'player1':
					player1Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						padding + (player1Count * ((Config.bonusRadius * 2) + padding)),
						this.ySize - (this.groundHeight / 2),
						bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKeyForList(),
						this.getBonusProgress(activeBonus, bonus)
					));
					break;
				case 'player2':
					player2Count++;
					this.bonusesGroup.add(this.engine.drawBonus(
						(this.xSize / 2) + padding + (player2Count * ((Config.bonusRadius * 2) + padding)),
						this.ySize - (this.groundHeight / 2),
						bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKeyForList(),
						this.getBonusProgress(activeBonus, bonus)
					));
					break;
			}
		}
	}

	getBonusProgress(activeBonus, bonus) {
		return 1 - ((this.getServerNormalizedTimestamp() - activeBonus.activatedAt) / bonus.getDuration());
	}

	updateCountdown() {
		if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
			let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
				scaleTo = 7;

			if (countdownText == 4 && this.isMatchPoint()) {
				countdownText = 'MATCH POINT';
				scaleTo = 3;

				if (this.isDeucePoint()) {
					countdownText = 'DEUCE';
				}
			}

			countdownText = this.engine.updateText(this.countdownText, countdownText);

			//Zoom numbers
			if (countdownText != this.lastCountdownNumber) {
				this.engine.animateScale(this.countdownText, scaleTo, scaleTo, 1, 1, 500);
				this.engine.animateSetOpacity(this.countdownText, 0, 1, 500);
			}

			this.lastCountdownNumber = countdownText;
		}
	}

	sendBallPosition() {
		var ballPositionData = this.engine.getPositionData(this.ball);

		ballPositionData = this.addServerNormalizedTimestampToPositionData(ballPositionData);

		this.lastBallUpdate = this.addToBundledStreamsAtFrequence(
			this.lastBallUpdate,
			Config.ballInterval,
			'moveClientBall',
			ballPositionData
		);
	}

	sendPlayerPosition(player) {
		var playerPositionData = this.engine.getPositionData(player);

		playerPositionData.isHost = this.isUserHost();
		playerPositionData.doingDropShot = player.doingDropShot;
		playerPositionData = this.addServerNormalizedTimestampToPositionData(playerPositionData);

		this.lastPlayerUpdate = this.addToBundledStreamsAtFrequence(
			this.lastPlayerUpdate,
			Config.playerInterval,
			'moveOppositePlayer',
			playerPositionData
		);
	}

	sendBonusesPosition() {
		let bonusesData = [];

		for (let bonus of this.bonuses) {
			let bonusPositionData = this.engine.getPositionData(bonus);

			bonusesData.push([
				bonus.identifier,
				this.addServerNormalizedTimestampToPositionData(bonusPositionData)
			]);
		}

		if (bonusesData.length) {
			this.lastBonusUpdate = this.addToBundledStreamsAtFrequence(
				this.lastBonusUpdate,
				Config.bonusInterval,
				'moveClientBonuses',
				bonusesData
			);
		}
	}

	addServerNormalizedTimestampToPositionData(data) {
		data['timestamp'] = this.getServerNormalizedTimestamp();

		return data;
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
		//Player can be at ground level if pushed by ball

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
			this.engine.getYPosition(ball) > this.engine.getYPosition(player) + (Constants.PLAYER_HEIGHT / 2)
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
		this.engine.setVerticalSpeed(ball, Constants.BALL_VERTICAL_SPEED_ON_PLAYER_HIT);
	}

	hitGround(ball, ground) {
		if (this.isUserHost() && this.gameResumed == true) {
			let pointSide;

			if (ball.x < this.xSize / 2) {
				pointSide = Constants.CLIENT_POINTS_COLUMN;
			} else {
				pointSide = Constants.HOST_POINTS_COLUMN;
			}

			this.gameResumed = false;
			Meteor.apply('addGamePoints', [this.gameId, pointSide], {noRetry: true}, () => {});
		}
	}

	inputs() {
		var player = this.getCurrentPlayer();

		if (!player) {
			return false;
		}

		player.doingDropShot = false;

		if (player.isFrozen) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			if (this.isLeftKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.leftMoveModifier * player.velocityXOnMove);
			} else if (this.isRightKeyDown()) {
				this.engine.setHorizontalSpeed(player, player.rightMoveModifier * player.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.isPlayerAtGroundLevel(player)) {
				if (this.isUpKeyDown()) {
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
			this.engine.isLeftKeyDown() || this.engine.isAKeyDown()
		);
	}

	isRightKeyDown() {
		return (
			this.engine.isRightKeyDown() || this.engine.isDKeyDown()
		);
	}

	isUpKeyDown() {
		return (
			this.engine.isUpKeyDown() || this.engine.isWKeyDown()
		);
	}

	isDropShotKeyDown() {
		return (
			this.engine.isDownKeyDown() || this.engine.isSKeyDown() || this.engine.isSpacebarKeyDown()
		);
	}

	isPlayerAtGroundLevel(player) {
		return (player.bottom >= this.ySize - this.groundHeight);
	}

	moveOppositePlayer(data) {
		var player;

		if (data.isHost) {
			player = this.player1;
		} else {
			player = this.player2;
		}

		if (!player) {
			return;
		}

		player.doingDropShot = data.doingDropShot;

		data = this.engine.interpolateFromTimestamp(this.getServerNormalizedTimestamp(), player, data);

		this.engine.move(player, data);
	}

	moveClientBall(data) {
		if (!this.ball) {
			return;
		}

		data = this.engine.interpolateFromTimestamp(this.getServerNormalizedTimestamp(), this.ball, data);

		this.engine.move(this.ball, data);
	}

	moveClientBonus(bonusIdentifier, data) {
		var correspondingBonus = this.getBonusFromIdentifier(bonusIdentifier);

		if (!correspondingBonus) {
			return;
		}

		data = this.engine.interpolateFromTimestamp(this.getServerNormalizedTimestamp(), correspondingBonus, data);

		this.engine.move(correspondingBonus, data);
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

		for (let bonus of this.bonuses) {
			this.engine.freeze(bonus);
		}
	}

	resumeGame() {
		this.engine.unfreeze(this.ball);
		this.ball.isFrozen = false;
		this.gameResumed = true;

		this.countdownText.text = '';
		this.countdownTimer.stop();
	}

	scalePlayer(playerKey, scale) {
		var player = this.getPlayerFromKey(playerKey),
			polygonKey = this.getPolygonKeyFromScale(scale);

		if (!player || !polygonKey) {
			return;
		}

		this.engine.scale(player, scale, scale);
		this.engine.loadPolygon(player, polygonKey, player.polygonObject);
		this.setupPlayerBody(player);
	}

	resetPlayerScale(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.scalePlayer(playerKey, 1);
	}

	setPlayerGravity(playerKey, gravity) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, gravity);
		}
	}

	resetPlayerGravity(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, player.initialGravity);
		}
	}

	scaleBall(scale) {
		var polygonKey = this.getPolygonKeyFromScale(scale);

		if (!polygonKey) {
			return;
		}

		this.engine.scale(this.ball, scale, scale);
		this.engine.loadPolygon(this.ball, polygonKey, this.ball.polygonObject);
		this.setupBallBody();
	}

	resetBallScale() {
		this.scaleBall(Constants.NORMAL_SCALE_BONUS);
	}

	setBallGravity(gravity) {
		this.engine.setGravity(this.ball, gravity);
	}

	resetBallGravity() {
		this.setBallGravity(this.ball.initialGravity);
	}

	changePlayerProperty(playerKey, property, value) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player[property] = value;
	}

	hidePlayingPlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (
			(this.isUserHost() && playerKey == 'player1') ||
			(this.isUserClient() && playerKey == 'player2')
		) {
			this.engine.setOpacity(player, 0);
		} else {
			this.engine.setOpacity(player, 0.5);
		}
	}

	showPlayingPlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setOpacity(player, 1);
	}

	freezePlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setMass(player, 2000);
		this.engine.freeze(player);
		player.isFrozen = true;
	}

	unFreezePlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setMass(player, player.initialMass);
		if (player.activeGravity !== null) {
			this.engine.setGravity(player, player.activeGravity);
		} else {
			this.engine.setGravity(player, player.initialGravity);
		}
		player.isFrozen = false;
	}

	drawCloud() {
		if (!this.cloudBonus) {
			this.cloudBonus = this.engine.addTileSprite(this.xSize / 2, this.ySize / 2, this.xSize, this.ySize, 'cloud');
			this.engine.setStatic(this.cloudBonus, true);
			this.engine.setOpacity(this.cloudBonus, 0);
		}

		this.engine.animateSetOpacity(this.cloudBonus, 1, this.engine.getOpacity(this.cloudBonus), 250);
	}

	hideCloud() {
		this.engine.animateSetOpacity(this.cloudBonus, 0, 1, 250);
	}

	shakeLevel() {
		this.engine.shake(this.level, 5, 20);
	}

	regenerateLastBonusCreatedAndFrequenceTime() {
		this.lastBonusCreated = getUTCTimeStamp();
		this.bonusFrequenceTime = getRandomInt(Config.bonusMinimumInterval, Config.bonusMaximumInterval);
	}

	createBonusIfTimeHasElapsed() {
		var frequenceTime = this.bonusFrequenceTime - Math.round((getUTCTimeStamp() - this.lastGameRespawn) / 10);

		if (frequenceTime < Config.bonusMinimumFrequence) {
			frequenceTime = Config.bonusMinimumFrequence;
		}

		if (getUTCTimeStamp() - this.lastBonusCreated >= frequenceTime) {
			//Host choose position and bonusCls
			let bonusClass = BonusFactory.getRandomBonusKey();
			let data = {
				initialX: this.xSize / 2 + Random.choice([-6, +6]),
				bonusKey: bonusClass,
				bonusIdentifier: bonusClass + '_' + this.getServerNormalizedTimestamp()
			};

			//Create the bonus the host
			this.createBonus(data);
			this.regenerateLastBonusCreatedAndFrequenceTime();
			//Add to bundled stream to send
			this.bundledStreamsToEmit.createBonus = data;
		}
	}

	createBonus(data) {
		var bonus = BonusFactory.getInstance(data.bonusKey, this),
			bonusSprite = this.engine.addBonus(
				data.initialX, Config.bonusGravityScale, this.bonusMaterial, this.bonusCollisionGroup,
				bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey()
			);

		bonusSprite.identifier = data.bonusIdentifier;
		bonusSprite.bonus = bonus;

		this.bonuses.push(bonusSprite);

		this.engine.collidesWith(bonusSprite, this.playerCollisionGroup, (bonusItem, player) => {
			if (this.isUserHost()) {
				//Activate bonus
				this.activateBonus(bonusSprite.identifier, this.engine.getKey(player));
				//Send to client
				ClientStream.emit('activateBonus-' + this.gameId, {identifier: bonusSprite.identifier, player: this.engine.getKey(player)});
			}
		}, this);
		this.engine.collidesWith(bonusSprite, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.groundHitDelimiterCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.ballCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.bonusCollisionGroup);
	}

	activateBonus(bonusIdentifier, playerKey) {
		var correspondingBonus = this.getBonusFromIdentifier(bonusIdentifier);

		if (!correspondingBonus) {
			return;
		}

		let bonus = correspondingBonus.bonus;

		bonus.activate(playerKey);
		bonus.start();

		this.deactivateSimilarBonusForPlayerKey(bonus, playerKey);

		this.activeBonuses.push(bonus);
		if (this.isUserHost()) {
			Meteor.call(
				'addActiveBonusToGame',
				this.gameId,
				bonus.getIdentifier(),
				bonus.getClassName(),
				bonus.getActivatedAt() + this.serverOffset,
				bonus.getTargetPlayerKey()
			);
		}

		this.removeBonusSprite(bonusIdentifier);
	}

	removeBonusSprite(bonusIdentifier) {
		var bonuses = [];

		for (let bonus of this.bonuses) {
			if (bonus.identifier === bonusIdentifier) {
				bonus.destroy();
			} else {
				bonuses.push(bonus);
			}
		}

		this.bonuses = bonuses;
	}

	deactivateSimilarBonusForPlayerKey(newBonus, playerKey) {
		for (let bonus of this.activeBonuses) {
			if (bonus.isSimilarBonusForPlayerKey(newBonus, playerKey)) {
				bonus.deactivateFromSimilar(newBonus);
			}
		}
	}

	checkBonuses() {
		var stillActiveBonuses = [];

		for (let bonus of this.activeBonuses) {
			if (bonus.check()) {
				stillActiveBonuses.push(bonus);
			} else if (this.isUserHost()) {
				Meteor.call('removeActiveBonusFromGame', this.gameId, bonus.getIdentifier());
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	resetAllBonuses() {
		//Remove bonus sprites
		for (let bonus of this.bonuses) {
			bonus.destroy();
		}
		this.bonuses = [];

		//Remove active bonuses
		for (let bonus of this.activeBonuses) {
			bonus.stop();
		}
		this.activeBonuses = [];
	}

};
