import BonusFactory from '/imports/game/BonusFactory.js';
import {isGameStatusStarted, isGameStatusTimeout, isGameStatusFinished} from '/imports/game/utils.js';
import {Games} from '/collections/games.js';
import {Players} from '/collections/players.js';
import {Config} from '/imports/lib/config.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';
import PhysicsData from '/public/assets/physicsData.json';

export default class Game {

	constructor(gameId, engine) {
		this.gameId = gameId;
		this.engine = engine;
		this.xSize = Constants.GAME_X_SIZE;
		this.ySize = Constants.GAME_Y_SIZE;

		this.gameResumed = false;
		this.bundledStreamsToEmit = {};
		this.bonuses = [];
		this.activeBonuses = [];
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
		let polygonKey = null;

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
		return getUTCTimeStamp();
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
		this.engine.loadData(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json', PhysicsData);
	}

	createGame() {
		this.createEnvironmentElements();
		this.resumeOnTimerEnd();
	}

	createEnvironmentElements() {
		let initialXLocation = Config.playerInitialLocation;
		let initialYLocation = this.ySize - Constants.GAME_GROUND_HEIGHT - (Constants.PLAYER_HEIGHT / 2);

		this.engine.createGame();

		this.createCollisionGroupsAndMaterials();

		/**
		 * Player 1
		 */
		this.player1 = this.engine.addSprite(initialXLocation, initialYLocation, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT, 'player1');
		this.createPlayer(this.player1, initialXLocation, initialYLocation, 'player1');

		/**
		 * Player 2
		 */
		initialXLocation = this.xSize - Config.playerInitialLocation;
		this.player2 = this.engine.addSprite(initialXLocation, initialYLocation, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT, 'player2');
		this.createPlayer(this.player2, initialXLocation, initialYLocation, 'player2');

		/**
		 * Ball
		 */
		this.createBall(Config.playerInitialLocation, this.ySize - Constants.GAME_GROUND_HEIGHT - Config.ballDistanceFromGround);

		/**
		 * Level
		 */
		this.loadLevel();

		this.bonusesGroup = this.engine.addGroup();
	}

	createCollisionGroupsAndMaterials() {
		this.playerCollisionGroup = this.engine.createCollisionGroup();
		this.ballCollisionGroup = this.engine.createCollisionGroup();
		this.bonusCollisionGroup = this.engine.createCollisionGroup();
		this.player1DelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.player2DelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.engine.createCollisionGroup();
		this.floorCollisionGroup = this.engine.createCollisionGroup();

		this.playerMaterial = this.engine.createMaterial('player');
		this.ballMaterial = this.engine.createMaterial('ball');
		this.bonusMaterial = this.engine.createMaterial('bonus');
		this.playerDelimiterMaterial = this.engine.createMaterial('netPlayerDelimiter');
		this.netDelimiterMaterial = this.engine.createMaterial('netDelimiter');
		this.floorMaterial = this.engine.createMaterial('groundDelimiter');

		this.engine.updateContactMaterials(
			this.ballMaterial, this.playerMaterial, this.playerDelimiterMaterial,
			this.bonusMaterial, this.netDelimiterMaterial, this.floorMaterial
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

		if (player === this.player1) {
			this.engine.collidesWith(player, this.player1DelimiterCollisionGroup);
		} else {
			this.engine.collidesWith(player, this.player2DelimiterCollisionGroup);
		}
		this.engine.collidesWith(player, this.ballCollisionGroup);
		this.engine.collidesWith(player, this.bonusCollisionGroup);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.engine.addSprite(initialXLocation, initialYLocation, Config.ballRadius * 2, Config.ballRadius * 2, 'ball');

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
		this.engine.collidesWith(this.ball, this.floorCollisionGroup, this.hitGround, this);
		this.engine.collidesWith(this.ball, this.bonusCollisionGroup);
	}

	loadLevel() {
		this.level = this.engine.addGroup();

		this.loadGroundLevel();

		this.loadNetLevel();
	}

	loadGroundLevel() {
		/**
		 * Player 1 delimiter
		 */
		let groupItem = this.engine.addTileSprite(
			this.xSize / 2,
			this.ySize - (Constants.GAME_GROUND_HEIGHT / 2),
			this.xSize,
			Constants.GAME_GROUND_HEIGHT,
			'delimiter',
			undefined,
			undefined,
			true
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.player1DelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Player 2 delimiter
		 */
		groupItem = this.engine.addTileSprite(
			this.xSize / 2,
			this.ySize - (Constants.GAME_GROUND_HEIGHT / 2),
			this.xSize,
			Constants.GAME_GROUND_HEIGHT,
			'delimiter',
			undefined,
			undefined,
			true
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.player2DelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Ball hit delimiter
		 */
		groupItem = this.engine.addTileSprite(
			this.xSize / 2,
			this.ySize - (Constants.GAME_GROUND_HEIGHT / 2),
			this.xSize,
			Constants.GAME_GROUND_HEIGHT,
			'delimiter'
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.floorMaterial);
		this.engine.setCollisionGroup(groupItem, this.floorCollisionGroup);
		this.engine.collidesWith(groupItem, this.ballCollisionGroup);
		this.engine.collidesWith(groupItem, this.bonusCollisionGroup);
	}

	loadNetLevel() {
		/**
		 * Player 1 delimiter
		 */
		let groupItem = this.engine.addTileSprite(
			(this.xSize / 4) * 3,
			(this.ySize / 2),
			(this.xSize + Constants.GAME_NET_WIDTH) / 2,
			this.ySize,
			'delimiter',
			undefined,
			undefined,
			true
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.player1DelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Player 2 delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 4),
			(this.ySize / 2),
			(this.xSize + Constants.GAME_NET_WIDTH) / 2,
			this.ySize,
			'delimiter',
			undefined,
			undefined,
			true
		);

		this.engine.setStatic(groupItem, true);
		this.engine.setMaterial(groupItem, this.playerDelimiterMaterial);
		this.engine.setCollisionGroup(groupItem, this.player2DelimiterCollisionGroup);
		this.engine.collidesWith(groupItem, this.playerCollisionGroup);

		/**
		 * Ball hit delimiter
		 */
		groupItem = this.engine.addTileSprite(
			(this.xSize / 2),
			this.ySize - Constants.GAME_GROUND_HEIGHT - (Constants.GAME_NET_HEIGHT / 2),
			Constants.GAME_NET_WIDTH,
			Constants.GAME_NET_HEIGHT,
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
			this.resumeIfGameIsOnGoing();
		}
	}

	resumeIfGameIsOnGoing() {
		this.startCountdownTimer();
	}

	startCountdownTimer() {
		let timerDuration = 3;

		if (this.isMatchPoint()) {
			//Add one second to show text
			timerDuration = 4;
		}

		this.countdownTimer = this.engine.startTimer(timerDuration, this.resumeGame, this);
	}

	respawnSprites() {
		this.spawnPlayer(this.player1);
		this.spawnPlayer(this.player2);
		this.spawnBall();
	}

	spawnPlayer(player) {
		this.engine.scale(player, 1, 1);
		this.engine.spawn(player, player.initialXLocation, player.initialYLocation, Constants.PLAYER_WIDTH, Constants.PLAYER_HEIGHT);
	}

	spawnBall() {
		let xBallPositionHostSide = Config.playerInitialLocation + (Constants.PLAYER_WIDTH / 4) + (Constants.BALL_RADIUS);
		let xBallPositionClientSide = this.xSize - Config.playerInitialLocation - (Constants.PLAYER_WIDTH / 4) - (Constants.BALL_RADIUS);
		let xBallPosition;

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

		this.engine.spawn(this.ball, xBallPosition, this.ySize - Constants.GAME_GROUND_HEIGHT - Config.ballDistanceFromGround, Config.ballRadius * 2, Config.ballRadius * 2);
	}

	updateGame() {
		throw 'Implement!';
	}

	render() {
	}

	resetBundledStreams() {
		//Reset bundled streams
		this.bundledStreamsToEmit = {};
	}

	applyIfBallIsFrozen() {
		//Do not allow ball movement if it is frozen
		if (this.ball.isFrozen) {
			this.engine.setHorizontalSpeed(this.ball, 0);
			this.engine.setVerticalSpeed(this.ball, 0);
		}
	}

	stopGameOnTimeout() {
		if (this.isGameTimeOut()) {
			this.stopGame();
			this.onGameEnd();
		}
	}

	addToBundledStreamsAtFrequence(lastCallTime, frequenceTime, streamName, argumentsToBundleWith) {
		if (getUTCTimeStamp() - lastCallTime >= frequenceTime) {
			this.bundledStreamsToEmit[streamName] = argumentsToBundleWith;

			lastCallTime = getUTCTimeStamp();
		}

		return lastCallTime;
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

		this.engine.constrainVelocity(ball, 900);
	}

	isPlayerJumpingForward(player, playerKey) {
		//Player can be at ground level if pushed by ball

		return (
			Math.round(this.engine.getVerticalSpeed(player)) < 0 &&
			!this.isPlayerAtGroundLevel(player) &&
			(
				(playerKey === 'player1' && this.engine.isSpeedDirectionRight(player)) ||
				(playerKey === 'player2' && this.engine.isSpeedDirectionLeft(player))
			)
		);
	}

	isBallInFrontOfPlayer(ball, player, playerKey) {
		return (
			(playerKey === 'player1' && this.engine.hasXPositionBefore(player, ball)) ||
			(playerKey === 'player2' && this.engine.hasXPositionBefore(ball, player))
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
			(playerKey === 'player1' && this.engine.isSpeedDirectionLeft(ball)) ||
			(playerKey === 'player2' && this.engine.isSpeedDirectionRight(ball))
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

	isPlayerAtGroundLevel(player) {
		return (this.engine.getBottom(player) >= this.ySize - Constants.GAME_GROUND_HEIGHT);
	}

	moveOppositePlayer(data) {
		let player;

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
	}

	scalePlayer(playerKey, scale) {
		let player = this.getPlayerFromKey(playerKey);
		let polygonKey = this.getPolygonKeyFromScale(scale);

		if (!player || !polygonKey) {
			return;
		}

		this.engine.scale(player, scale, scale);
		this.engine.loadPolygon(player, polygonKey, player.polygonObject);
		this.setupPlayerBody(player);
	}

	resetPlayerScale(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.scalePlayer(playerKey, 1);
	}

	setPlayerGravity(playerKey, gravity) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, gravity);
		}
	}

	resetPlayerGravity(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		if (!player.isFrozen) {
			this.engine.setGravity(player, player.initialGravity);
		}
	}

	scaleBall(scale) {
		let polygonKey = this.getPolygonKeyFromScale(scale);

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
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player[property] = value;
	}

	hidePlayingPlayer(playerKey) {
		//Does nothing on server side
	}

	showPlayingPlayer(playerKey) {
		//Does nothing on server side
	}

	freezePlayer(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.engine.setMass(player, 2000);
		this.engine.freeze(player);
		player.isFrozen = true;
	}

	unFreezePlayer(playerKey) {
		let player = this.getPlayerFromKey(playerKey);

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
		//Does nothing on server side
	}

	hideCloud() {
		//Does nothing on server side
	}

	createBonus(data) {
		let bonus = BonusFactory.getInstance(data.bonusKey, this);
		let bonusSprite = this.engine.addBonus(
			data.initialX, Config.bonusGravityScale, this.bonusMaterial, this.bonusCollisionGroup,
			bonus.getLetter(), bonus.getFontSize(), bonus.getSpriteBorderKey()
		);

		bonusSprite.identifier = data.bonusIdentifier;
		bonusSprite.bonus = bonus;

		this.bonuses.push(bonusSprite);

		this.engine.collidesWith(bonusSprite, this.netHitDelimiterCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.floorCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.ballCollisionGroup);
		this.engine.collidesWith(bonusSprite, this.bonusCollisionGroup);

		return bonusSprite;
	}

	activateBonus(bonusIdentifier, playerKey) {
		let correspondingBonus = this.getBonusFromIdentifier(bonusIdentifier);

		if (!correspondingBonus) {
			return;
		}

		let bonus = correspondingBonus.bonus;

		this.deactivateSimilarBonusForPlayerKey(bonus, playerKey);

		bonus.activate(playerKey);
		bonus.start();

		this.activeBonuses.push(bonus);
		this.removeBonusSprite(bonusIdentifier);

		return bonus;
	}

	removeBonusSprite(bonusIdentifier) {
		let bonuses = [];

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
		let stillActiveBonuses = [];

		for (let bonus of this.activeBonuses) {
			if (bonus.check()) {
				stillActiveBonuses.push(bonus);
			} else {
				this.removeBonus(bonus);
			}
		}

		this.activeBonuses = stillActiveBonuses;
	}

	removeBonus(bonus) {
		//Do nothing
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
