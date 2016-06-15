import PhaserEngine from '/client/lib/game/engine/PhaserEngine.js';
import BonusFactory from '/client/lib/game/BonusFactory.js';

export default class Game {

	constructor() {
		this.lastKeepAliveUpdate = 0;
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.lastBonusUpdate = 0;
		this.ballRespawn = false;
		this.lastBonusActivated = 0;
		this.bonusFrequenceTime = 0;
		this.lastGameRespawn = 0;
		this.bonus = null;
		this.bonuses = [];
	}

	getGame() {
		return Games.findOne({_id: Session.get('game')});
	}

	getPlayer() {
		return Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
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

	isGamePoint() {
		var game = this.getGame(),
			gamePoint = Config.maximumPoints - 1;

		if (game) {
			return (
				game.hostPoints == gamePoint ||
				game.clientPoints == gamePoint
			);
		}

		return false;
	}

	getWinnerName() {
		var game = this.getGame(),
			winnerName = 'Nobody',
			winner;

		if (game) {
			if (game.hostPoints >= Config.maximumPoints) {
				winner = this.getHostPlayer(game);

				if (winner) {
					winnerName = winner.name;
				} else {
					winnerName = 'Player 1';
				}
			} else if (game.clientPoints >= Config.maximumPoints) {
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
		this.engine = new PhaserEngine();
		this.engine.start(
			Config.xSize, Config.ySize, 'gameContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
	}

	stop() {
		this.engine.stop();
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
			initialYLocation = Config.ySize - Config.groundHeight - (Config.playerHeight / 2);

		this.engine.createGame();

		/**
		 * Collision groups and materials
		 */
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

		/**
		 * Player 1
		 */
		this.player1 = this.engine.addSprite(initialXLocation, initialYLocation, 'player1');
		this.createPlayer(this.player1, initialXLocation, initialYLocation, 'player1');

		/**
		 * Player 2
		 */
		initialXLocation = Config.xSize - Config.playerInitialLocation;
		this.player2 = this.engine.addSprite(initialXLocation, initialYLocation, 'player2');
		this.createPlayer(this.player2, initialXLocation, initialYLocation, 'player2');

		/**
		 * Ball
		 */
		this.createBall();

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

		this.engine.addKeyControllers();

		this.resumeOnTimerEnd();
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

	createBall() {
		this.ball = this.engine.addSprite(Config.playerInitialLocation, Config.ySize - Config.groundHeight - Config.ballDistanceFromGround, 'ball');

		this.ball.initialGravity = Config.ballGravityScale;
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
		var groupItem;

		/**
		 * Level look
		 */
		this.level = this.engine.addGroup();

		//Ground
		this.engine.addTileSprite(
			0,
			Config.ySize - Config.groundHeight,
			Config.xSize,
			Config.groundHeight,
			'ground',
			this.level
		);

		//Net
		this.engine.addTileSprite(
			(Config.xSize / 2) - (Config.netThickness / 2),
			Config.ySize - Config.groundHeight - Config.netHeight,
			Config.netThickness,
			Config.netHeight,
			'net',
			this.level
		);

		/**
		 * Player ground delimiter
		 */
		//Ground
		groupItem = this.engine.addTileSprite(
			Config.xSize / 2,
			Config.ySize - (Config.groundHeight / 2),
			Config.xSize,
			Config.groundHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.playerDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Player net delimiter
		 */
		//Net
		groupItem = this.engine.addTileSprite(
			(Config.xSize / 2),
			(Config.ySize / 2),
			Config.netThickness,
			Config.ySize,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.playerDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Ball Net hit delimiter
		 */
		//Net
		groupItem = this.engine.addTileSprite(
			(Config.xSize / 2),
			Config.ySize - Config.groundHeight - (Config.netHeight / 2),
			Config.netThickness,
			Config.netHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.netDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.ballCollisionGroup);
		this.engine.collidesWith(groupItem, this.bonusCollisionGroup);

		/**
		 * Ball Ground hit delimiter
		 */
		//Ground
		groupItem = this.engine.addTileSprite(
			Config.xSize / 2,
			Config.ySize - (Config.groundHeight / 2),
			Config.xSize,
			Config.groundHeight,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.groundDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.groundHitDelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.ballCollisionGroup);
		this.engine.collidesWith(groupItem, this.bonusCollisionGroup);
	}

	resumeOnTimerEnd() {
		this.resetAllBonuses();
		this.pauseGame();
		this.respawnSprites();

		if (this.isGameFinished()) {
			this.engine.updateInformationText(this.getWinnerName() + ' wins!');
		} else if (this.isGameOnGoing()) {
			this.startCountdownTimer();
			this.generateBonusActivationAndFrequenceTime();
			this.lastGameRespawn = this.engine.getTime();
		}
	}

	startCountdownTimer() {
		var timerDuration = 3;

		if (this.isGamePoint()) {
			//Add one second to show 'GAME POINT'
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
		var xBallPositionHostSide = Config.playerInitialLocation + (Config.playerWidth / 4) + (Config.ballRadius),
			xBallPositionClientSide = Config.xSize - Config.playerInitialLocation - (Config.playerWidth / 4) - (Config.ballRadius),
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

		this.engine.spawn(this.ball, xBallPosition, Config.ySize - Config.groundHeight - Config.ballDistanceFromGround);
		this.ballRespawn = true;
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

			this.engine.updateInformationText('The game has timed out...');
		}
	}

	updateCountdown() {
		if (this.countdownTimer && this.engine.isTimerRunning(this.countdownTimer)) {
			let countdownText = Math.ceil(this.engine.getTimerRemainingDuration(this.countdownTimer) / 1000),
				scaleTo = 7;

			if (countdownText == 4 && this.isGamePoint()) {
				countdownText = 'GAME POINT';
				scaleTo = 3;
			}

			this.countdownText.text = countdownText;

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
			'moveClientBall-' + Session.get('game'),
			[ballPositionData]
		);
	}

	sendPlayerPosition(player) {
		var playerPositionData = this.engine.getPositionData(player);

		this.lastPlayerUpdate = this.emitGameStreamAtFrequence(
			this.lastPlayerUpdate,
			Config.playerInterval,
			'moveOppositePlayer-' + Session.get('game'),
			[this.isUserHost(), playerPositionData]
		);
	}

	sendBonusPosition() {
		var bonusPositionData = this.engine.getPositionData(this.bonus);

		this.lastBonusUpdate = this.emitGameStreamAtFrequence(
			this.lastBonusUpdate,
			Config.bonusInterval,
			'moveClientBonus-' + Session.get('game'),
			[bonusPositionData]
		);
	}

	hitBall(ball, player) {
		this.engine.reboundOrSmashOnPlayerHitBall(ball, player, Config.ballVelocityYOnPlayerHit);
	}

	hitGround(ball, ground) {
		if (this.isUserHost() && this.ballRespawn == true) {
			let pointSide;

			if (ball.x < Config.xSize / 2) {
				pointSide = Constants.CLIENT_POINTS_COLUMN;
			} else {
				pointSide = Constants.HOST_POINTS_COLUMN;
			}

			this.ballRespawn = false;
			Meteor.call('addGamePoints', Session.get('game'), pointSide, () => {
				this.shakeLevel();
				this.resumeOnTimerEnd();

				//The socket will tell the client when to shake and respawn to resume in sync
				GameStream.emit('shakeLevelAndResumeOnTimerEnd-' + Session.get('game'));
			});
		}
	}

	inputs() {
		var player = this.getCurrentPlayer();

		if (!player) {
			return;
		}

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
			}
		}

		this.sendPlayerPosition(player);
	}

	isPlayerAtGroundLevel(player) {
		return (player.bottom >= Config.ySize - Config.groundHeight);
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
			GameStream.emit.apply(this, [streamToEmit].concat(argumentsToEmitWith));

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
			this.cloudBonus = this.engine.addSprite(Config.xSize / 2, Config.ySize / 2, 'cloud');
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
		var frequenceTime = this.bonusFrequenceTime - Math.round((this.engine.getTime() - this.lastGameRespawn) / 25);

		if (frequenceTime < 0) {
			frequenceTime = 0;
		}

		//Only one bonus sprite at the same time
		if (this.bonus === null && this.engine.getTime() - this.lastBonusActivated >= frequenceTime) {
			//Host choose position and bonusCls
			let data = {
				initialX: Config.xSize / 2 + Random.choice([-6, +6]),
				bonusKey: BonusFactory.getRandomBonusKey()
			};

			//Create the bonus the host
			this.createBonus(data);
			//Send to client
			GameStream.emit('createBonus-' + Session.get('game'), data);
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
				GameStream.emit('activateBonus-' + Session.get('game'), this.engine.getKey(player));
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

		this.deactivateSimilarBonusForPlayerKey(this.bonus.bonus, playerKey);

		this.bonus.bonus.activate(playerKey);
		this.bonus.bonus.start();

		this.bonuses.push(this.bonus.bonus);

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
