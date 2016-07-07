import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';
import PhaserEngine from '/client/lib/game/engine/PhaserEngine.js';
import BonusFactory from '/client/lib/game/BonusFactory.js';

export default class Game {

	constructor(gameId) {
		this.gameId = gameId;
		this.engine = new PhaserEngine();
		this.xSize = Constants.GAME_X_SIZE;
		this.ySize = Constants.GAME_Y_SIZE;
		this.groundHeight = Constants.GAME_GROUND_HEIGHT;
		this.lastKeepAliveUpdate = 0;
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.lastBonusUpdate = 0;
		this.gameResumed = false;
		this.lastBonusActivated = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
		this.bonus = null;
		this.bonuses = [];
		this.serverOffset = TimeSync.serverOffset();
	}

	getGame() {
		return Games.findOne({_id: this.gameId});
	}

	getPlayer() {
		return Players.findOne({gameId: this.gameId, userId: Meteor.userId()});
	}

	getHostPlayer(game) {
		return Players.findOne({gameId: game._id, userId: game.createdBy});
	}

	getClientPlayer(game) {
		return Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		var game = this.getGame(),
			player;

		if (!game) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		if (playerKey == 'player1') {
			player = this.getHostPlayer(game);
		} else {
			player = this.getClientPlayer(game);
		}

		if (!player) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	isUserHost() {
		var game = this.getGame();

		return (game && game.createdBy === Meteor.userId());
	}

	isUserClient() {
		var game = this.getGame(),
			player = this.getPlayer();

		return (game && game.createdBy !== Meteor.userId() && player);
	}

	isGameOnGoing() {
		var game = this.getGame();

		return (game && game.status === Constants.GAME_STATUS_STARTED);
	}

	isGameTimeOut() {
		var game = this.getGame();

		return (game && game.status === Constants.GAME_STATUS_TIMEOUT);
	}

	isGameFinished() {
		var game = this.getGame();

		return (game && game.status === Constants.GAME_STATUS_FINISHED);
	}

	getGameLastPointTaken() {
		var game = this.getGame();

		return (game && game.lastPointTaken);
	}

	hasGameBonuses() {
		var game = this.getGame();

		return (game && game.hasBonuses);
	}

	isMatchPoint() {
		var game = this.getGame(),
			matchPoint = Constants.MAXIMUM_POINTS - 1;

		if (game) {
			return (
				game.hostPoints == matchPoint ||
				game.clientPoints == matchPoint
			);
		}

		return false;
	}

	isDeucePoint() {
		var game = this.getGame(),
			matchPoint = Constants.MAXIMUM_POINTS - 1;

		if (game) {
			return (
				game.hostPoints == matchPoint &&
				game.clientPoints == matchPoint
			);
		}

		return false;
	}

	getWinnerName() {
		var game = this.getGame(),
			winnerName = 'Nobody',
			winner;

		if (game && this.isGameFinished()) {
			if (game.hostPoints >= Constants.MAXIMUM_POINTS) {
				winner = this.getHostPlayer(game);

				if (winner) {
					winnerName = winner.name;
				} else {
					winnerName = 'Player 1';
				}
			} else if (game.clientPoints >= Constants.MAXIMUM_POINTS) {
				winner = this.getClientPlayer(game);

				if (winner) {
					winnerName = winner.name;
				} else {
					winnerName = 'Player 2';
				}
			}
		}

		return winnerName;
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

	start() {
		this.engine.start(
			this.xSize, this.ySize, 'gameContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
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

		/**
		 * Information text
		 */
		this.informationText = this.engine.addText(this.engine.getCenterX(), this.engine.getCenterY(), '', {
			font: '40px Oxygen, sans-serif',
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
		player.initialGravity = Config.playerGravityScale;
		player.leftMoveModifier = -1;
		player.rightMoveModifier = 1;
		player.velocityXOnMove = Config.playerVelocityXOnMove;
		player.velocityYOnJump = Config.playerVelocityYOnJump;
		player.canMove = true;
		player.canJump = true;
		player.doingDropShot = false;

		player.polygonObject = 'player-' + this.getPlayerShapeFromKey(playerKey);
		this.engine.loadPolygon(player, Constants.NORMAL_SCALE_PHYSICS_DATA, player.polygonObject);

		this.setupPlayerBody(player);
	}

	setupPlayerBody(player) {
		this.engine.setFixedRotation(player, true);
		this.engine.setMass(player, Config.playerMass);
		this.engine.setGravity(player, player.initialGravity);

		this.engine.setMaterial(player, this.playerMaterial);
		this.engine.setCollisionGroup(player, this.playerCollisionGroup);

		this.engine.collidesWith(player, this.playerDelimiterCollisionGroup);
		this.engine.collidesWith(player, this.ballCollisionGroup);
		this.engine.collidesWith(player, this.bonusCollisionGroup);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.engine.addSprite(initialXLocation, initialYLocation, 'ball');

		this.ball.initialGravity = Constants.BALL_GRAVITY_SCALE;
		this.ball.polygonObject = 'ball';
		this.engine.loadPolygon(this.ball, Constants.NORMAL_SCALE_PHYSICS_DATA, 'ball');

		this.setupBallBody();
	}

	setupBallBody() {
		this.engine.setFixedRotation(this.ball, true);
		this.engine.setGravity(this.ball, this.ball.initialGravity);
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
		this.resetAllBonuses();
		this.pauseGame();
		this.respawnSprites();

		if (this.isGameFinished()) {
			this.engine.updateText(this.informationText, this.getWinnerName() + ' wins!');
			this.onGameEnd();
		} else if (this.isGameOnGoing()) {
			this.startCountdownTimer();
			this.generateBonusActivationAndFrequenceTime();
			this.lastGameRespawn = this.engine.getTime();
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

		switch (this.getGameLastPointTaken()) {
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
		let player = this.getPlayer();

		if (player) {
			this.lastKeepAliveUpdate = this.callMeteorMethodAtFrequence(
				this.lastKeepAliveUpdate, Config.keepAliveInterval, 'keepPlayerAlive', [player._id]
			);
		}

		if (this.isGameOnGoing()) {
			this.inputs();
			this.checkBonuses();
			this.updatePlayerBonuses();

			this.updateCountdown();

			//Send ball position to database only if it has changed
			if (this.isUserHost()) {
				this.sendBallPosition();

				if (this.hasGameBonuses()) {
					this.createBonusIfTimeHasElapsed();

					if (this.bonus) {
						this.sendBonusPosition();
					}
				}
			}
		} else if (this.isGameTimeOut()) {
			this.stopGame();
			this.engine.updateText(this.informationText, 'The game has timed out...');
			this.onGameEnd();
		}
	}

	updatePlayerBonuses() {
		var game = this.getGame();

		if (game) {
			this.bonusesGroup.removeAll(true);

			let padding = 5,
				player1Count = 0,
				player2Count = 0;

			for (let activeBonus of game.activeBonuses) {
				let bonus = BonusFactory.getInstance(activeBonus.bonusClass, this);

				switch (activeBonus.targetPlayerKey) {
					case 'player1':
						player1Count++;
						this.bonusesGroup.add(this.engine.drawBonus(
							padding + (player1Count * ((Config.bonusRadius * 2) + padding)),
							this.ySize - (this.groundHeight / 2),
							bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey(),
							this.getBonusProgress(activeBonus, bonus)
						));
						break;
					case 'player2':
						player2Count++;
						this.bonusesGroup.add(this.engine.drawBonus(
							(this.xSize / 2) + padding + (player2Count * ((Config.bonusRadius * 2) + padding)),
							this.ySize - (this.groundHeight / 2),
							bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey(),
							this.getBonusProgress(activeBonus, bonus)
						));
						break;
				}
			}
		}
	}

	getBonusProgress(activeBonus, bonus) {
		return 1 - ((getUTCTimeStamp() + this.serverOffset - activeBonus.activatedAt) / bonus.getDuration());
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

		this.lastBallUpdate = this.emitGameStreamAtFrequence(
			this.lastBallUpdate,
			Config.ballInterval,
			'moveClientBall-' + this.gameId,
			[ballPositionData]
		);
	}

	sendPlayerPosition(player) {
		var playerPositionData = this.engine.getPositionData(player);

		playerPositionData.doingDropShot = player.doingDropShot;

		this.lastPlayerUpdate = this.emitGameStreamAtFrequence(
			this.lastPlayerUpdate,
			Config.playerInterval,
			'moveOppositePlayer-' + this.gameId,
			[this.isUserHost(), playerPositionData]
		);
	}

	sendBonusPosition() {
		var bonusPositionData = this.engine.getPositionData(this.bonus);

		this.lastBonusUpdate = this.emitGameStreamAtFrequence(
			this.lastBonusUpdate,
			Config.bonusInterval,
			'moveClientBonus-' + this.gameId,
			[bonusPositionData]
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
		this.engine.setHorizontalSpeed(ball, 0);
		this.engine.setVerticalSpeed(ball, 0);
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

		if (!player.canMove) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			if (this.engine.isKeyLeftDown()) {
				this.engine.setHorizontalSpeed(player, player.leftMoveModifier * player.velocityXOnMove);
			} else if (this.engine.isKeyRightDown()) {
				this.engine.setHorizontalSpeed(player, player.rightMoveModifier * player.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.isPlayerAtGroundLevel(player)) {
				if (this.engine.isKeyUpDown() && player.canJump) {
					this.engine.setVerticalSpeed(player, -player.velocityYOnJump);
				} else {
					this.engine.setVerticalSpeed(player, 0);
				}
			} else {
				player.doingDropShot = (this.isDropShotKeyDown());
			}
		}

		this.sendPlayerPosition(player);

		return true;
	}

	isDropShotKeyDown() {
		return (
			this.engine.isKeyDownDown() || this.engine.isKeyDDown()
		);
	}

	isPlayerAtGroundLevel(player) {
		return (player.bottom >= this.ySize - this.groundHeight);
	}

	moveOppositePlayer(data) {
		var player;

		if (this.isUserHost()) {
			player = this.player2;
		} else if (this.isUserClient()) {
			player = this.player1;
		}

		if (!player) {
			return;
		}

		player.doingDropShot = data.doingDropShot;

		this.engine.move(player, data);
	}

	moveClientBall(data) {
		if (!this.ball) {
			return;
		}

		this.engine.move(this.ball, data);
	}

	moveClientBonus(data) {
		if (!this.bonus) {
			return;
		}

		this.engine.move(this.bonus, data);
	}

	pauseGame() {
		this.engine.freeze(this.ball);
	}

	stopGame() {
		this.engine.freeze(this.player1);
		this.engine.freeze(this.player2);
		this.engine.freeze(this.ball);

		if (this.bonus) {
			this.engine.freeze(this.bonus);
		}
	}

	resumeGame() {
		this.engine.unfreeze(this.ball);
		this.gameResumed = true;

		this.countdownText.text = '';
		this.countdownTimer.stop();
	}

	callMeteorMethodAtFrequence(lastCallTime, frequenceTime, methodToCall, argumentsToCallWith) {
		if (this.engine.getTime() - lastCallTime >= frequenceTime) {
			Meteor.apply(methodToCall, argumentsToCallWith);

			lastCallTime = this.engine.getTime();
		}

		return lastCallTime;
	}

	emitGameStreamAtFrequence(lastCallTime, frequenceTime, streamToEmit, argumentsToEmitWith) {
		if (this.engine.getTime() - lastCallTime >= frequenceTime) {
			GameStream.emit.apply(GameStream, [streamToEmit].concat(argumentsToEmitWith));

			lastCallTime = this.engine.getTime();
		}

		return lastCallTime;
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
	}

	unFreezePlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setMass(player, Config.playerMass);
		this.engine.unfreeze(player);
	}

	drawCloud() {
		if (!this.cloudBonus) {
			this.cloudBonus = this.engine.addSprite(this.xSize / 2, this.ySize / 2, 'cloud');
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

	generateBonusActivationAndFrequenceTime() {
		this.lastBonusActivated = this.engine.getTime();
		this.bonusFrequenceTime = getRandomInt(Config.bonusMinimumInterval, Config.bonusMaximumInterval);
	}

	createBonusIfTimeHasElapsed() {
		var frequenceTime = this.bonusFrequenceTime - Math.round((this.engine.getTime() - this.lastGameRespawn) / 10);

		if (frequenceTime < 0) {
			frequenceTime = 0;
		}

		//Only one bonus sprite at the same time
		if (this.bonus === null && this.engine.getTime() - this.lastBonusActivated >= frequenceTime) {
			//Host choose position and bonusCls
			let data = {
				initialX: this.xSize / 2 + Random.choice([-6, +6]),
				bonusKey: BonusFactory.getRandomBonusKey()
			};

			//Create the bonus the host
			this.createBonus(data);
			//Send to client
			GameStream.emit('createBonus-' + this.gameId, data);
		}
	}

	createBonus(data) {
		var bonus = BonusFactory.getInstance(data.bonusKey, this);

		this.bonus = this.engine.addBonus(
			data.initialX, Config.bonusGravityScale, this.bonusMaterial, this.bonusCollisionGroup,
			bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey()
		);
		this.bonus.bonus = bonus;

		this.engine.collidesWith(this.bonus, this.playerCollisionGroup, (bonusItem, player) => {
			if (this.isUserHost()) {
				//Activate bonus
				this.activateBonus(this.engine.getKey(player));
				this.generateBonusActivationAndFrequenceTime();
				//Send to client
				GameStream.emit('activateBonus-' + this.gameId, this.engine.getKey(player));
			}
		}, this);
		this.engine.collidesWith(this.bonus, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(this.bonus, this.groundHitDelimiterCollisionGroup);
		this.engine.collidesWith(this.bonus, this.ballCollisionGroup);
	}

	activateBonus(playerKey) {
		if (!this.bonus || !this.bonus.bonus) {
			return;
		}

		let bonus = this.bonus.bonus;

		this.deactivateSimilarBonusForPlayerKey(bonus, playerKey);

		bonus.activate(playerKey);
		bonus.start();

		this.bonuses.push(bonus);
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

		this.bonus.destroy();
		this.bonus = null;
	}

	deactivateSimilarBonusForPlayerKey(newBonus, playerKey) {
		for (let bonus of this.bonuses) {
			if (bonus.isSimilarBonusForPlayerKey(newBonus, playerKey)) {
				bonus.deactivateFromSimilar(newBonus);
			}
		}
	}

	checkBonuses() {
		var stillActiveBonuses = [];

		for (let bonus of this.bonuses) {
			if (bonus.check()) {
				stillActiveBonuses.push(bonus);
			} else if (this.isUserHost()) {
				Meteor.call('removeActiveBonusFromGame', this.gameId, bonus.getIdentifier());
			}
		}

		this.bonuses = stillActiveBonuses;
	}

	resetAllBonuses() {
		if (this.bonus !== null) {
			this.bonus.destroy();
			this.bonus = null;
		}

		for (let bonus of this.bonuses) {
			bonus.stop();
		}

		this.bonuses = [];
	}

};
