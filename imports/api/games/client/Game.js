import ArtificialIntelligence from '/imports/api/games/artificialIntelligence/ArtificialIntelligence.js';
import GameBonus from '/imports/api/games/client/bonus/GameBonus.js';
import Collisions from '/imports/api/games/collisions/Collisions.js';
import {
	CLIENT_POINTS_COLUMN,
	CLIENT_SIDE,
	HOST_POINTS_COLUMN,
	HOST_SIDE,
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
	 * @param {StreamBundler} streamBundler
	 * @param {ServerNormalizedTime} serverNormalizedTime
	 */
	constructor(
		gameId,
		deviceController,
		engine,
		gameData,
		gameConfiguration,
		gameSkin,
		streamBundler,
		serverNormalizedTime
	) {
		this.gameId = gameId;
		this.deviceController = deviceController;
		this.engine = engine;
		this.gameData = gameData;
		this.gameConfiguration = gameConfiguration;
		this.gameSkin = gameSkin;
		this.streamBundler = streamBundler;
		this.serverNormalizedTime = serverNormalizedTime;
		this.lastBallPositionData = {};
		this.lastPlayerPositionData = {};
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = {};
		this.lastPointAt = 0;
		this.gameResumed = false;
		this.gameInitiated = false;
		this.streamBundler.resetBundledStreams();

		this.gameBonus = new GameBonus(
			this,
			this.engine,
			this.gameData,
			this.gameConfiguration,
			this.streamBundler,
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
		this.artificialIntelligence = new ArtificialIntelligence();
	}

	getCurrentPlayer() {
		const key = this.gameData.getCurrentPlayerKey();

		return this.getPlayerFromKey(key);
	}

	getPlayerFromKey(playerKey) {
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

		for (let i in this.gameBonus.robots) {
			if (this.gameBonus.robots.hasOwnProperty(i) && i === playerKey) {
				return this.gameBonus.robots[i];
			}
		}

		return null;
	}

	hostPlayerKeys() {
		const playerKeys = [
			'player1',
			'player3'
		];

		for (let robotId in this.gameBonus.robots) {
			if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerHostSide(this.gameBonus.robots[robotId])) {
				playerKeys.push(robotId);
			}
		}

		return playerKeys;
	}

	clientPlayerKeys() {
		const playerKeys = [
			'player2',
			'player4'
		];

		for (let robotId in this.gameBonus.robots) {
			if (this.gameBonus.robots.hasOwnProperty(robotId) && this.isPlayerClientSide(this.gameBonus.robots[robotId])) {
				playerKeys.push(robotId);
			}
		}

		return playerKeys;
	}

	getPlayerKeys() {
		const playerKeys = [
			'player1',
			'player2',
			'player3',
			'player4'
		];

		for (let robotId in this.gameBonus.robots) {
			if (this.gameBonus.robots.hasOwnProperty(robotId)) {
				playerKeys.push(robotId);
			}
		}

		return playerKeys;
	}

	isPlayerKey(key) {
		return [
			'player1',
			'player2',
			'player3',
			'player4'
		].indexOf(key) >= 0;
	}

	getComputerPlayerKeys() {
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
		for (let i in this.gameBonus.robots) {
			if (this.gameBonus.robots.hasOwnProperty(i)) {
				playerKeys.push(i);
			}
		}

		return playerKeys;
	}

	getPlayerInitialXFromKey(playerKey, isHost) {
		switch (playerKey) {
			case 'player1':
				return this.gameConfiguration.player1InitialX();
			case 'player2':
				return this.gameConfiguration.player2InitialX();
			case 'player3':
				return this.gameConfiguration.player3InitialX();
			case 'player4':
				return this.gameConfiguration.player4InitialX();
		}

		if (isHost) {
			return this.gameConfiguration.player1InitialX();
		} else {
			return this.gameConfiguration.player2InitialX();
		}
	}

	isPlayerHostSide(player) {
		return player && !!player.data.isHost;
	}

	isPlayerClientSide(player) {
		return player && !!player.data.isClient;
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
				smallPlayerScale: this.gameConfiguration.smallPlayerScale(),
				bigPlayerScale: this.gameConfiguration.bigPlayerScale(),
				smallBallScale: this.gameConfiguration.smallBallScale(),
				bigBallScale: this.gameConfiguration.bigBallScale(),
				renderTo: 'gameContainer'
			},
			this.preloadGame, this.createGame, this.updateGame, this
		);
	}

	onPointTaken() {
		if (this.gameInitiated) {
			this.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
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
			this.deviceController.stopMonitoring();
			Session.set('userCurrentlyPlaying', false);
			this.gameHasEnded = true;
		}
	}

	preloadGame() {
		this.gameSkin.preload(
			this.engine,
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);
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

		this.artificialIntelligence.startGame();
		this.resumeOnTimerEnd();
	}

	createArtificialIntelligence() {
		if (this.gameData.isFirstPlayerComputer()) {
			this.artificialIntelligence.addComputerWithKey(
				'player1',
				this.gameData.isFirstPlayerComputerMachineLearning()
			);
		}
		if (this.gameData.isSecondPlayerComputer()) {
			this.artificialIntelligence.addComputerWithKey(
				'player2',
				this.gameData.isSecondPlayerComputerMachineLearning()
			);
		}
		if (this.gameData.isThirdPlayerComputer()) {
			this.artificialIntelligence.addComputerWithKey(
				'player3',
				this.gameData.isThirdPlayerComputerMachineLearning()
			);
		}
		if (this.gameData.isFourthPlayerComputer()) {
			this.artificialIntelligence.addComputerWithKey(
				'player4',
				this.gameData.isFourthPlayerComputerMachineLearning()
			);
		}
	}

	createComponents() {
		this.collisions.init();

		this.createArtificialIntelligence();

		this.player1 = this.createHostPlayer('player1', '#a73030');
		this.player2 = this.createClientPlayer('player2', '#274b7a');

		if (this.gameData.isTwoVersusTwo()) {
			this.player3 = this.createHostPlayer('player3', '#d46969');
			this.addPlayerCanJumpOnBodies(this.player3);

			this.player4 = this.createClientPlayer('player4', '#437bc4');
			this.addPlayerCanJumpOnBodies(this.player4);
		}

		this.createBall(
			this.gameConfiguration.ballInitialHostX(),
			this.gameConfiguration.ballInitialY()
		);

		this.levelComponents.createLevelComponents();
		this.addPlayerCanJumpOnBody(this.player1, this.levelComponents.groundBound);
		this.addPlayerCanJumpOnBody(this.player2, this.levelComponents.groundBound);
		if (this.gameData.isTwoVersusTwo()) {
			this.addPlayerCanJumpOnBody(this.player3, this.levelComponents.groundBound);
			this.addPlayerCanJumpOnBody(this.player4, this.levelComponents.groundBound);
		}

		this.createCountdownText();
	}

	createHostPlayer(key, color) {
		const player = this.engine.addSprite(
			this.getPlayerInitialXFromKey(key, true),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShapeFromKey(key)
		);

		player.data.key = key;
		player.data.isHost = true;

		if (color) {
			this.engine.setTint(player, color);
		}

		this.initPlayer(
			player,
			this.getPlayerInitialXFromKey(key, true),
			this.gameConfiguration.playerInitialY(),
			this.collisions.hostPlayerCollisionGroup
		);

		return player;
	}

	createClientPlayer(key, color) {
		const player = this.engine.addSprite(
			this.getPlayerInitialXFromKey(key, false),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShapeFromKey(key)
		);

		player.data.key = key;
		player.data.isClient = true;

		if (color) {
			this.engine.setTint(player, color);
		}

		this.initPlayer(
			player,
			this.getPlayerInitialXFromKey(key, false),
			this.gameConfiguration.playerInitialY(),
			this.collisions.clientPlayerCollisionGroup
		);

		return player;
	}

	addPlayerCanJumpOnBodies(player) {
		let teammatePlayerKeys = [];

		if (this.isPlayerHostSide(player)) {
			teammatePlayerKeys = this.hostPlayerKeys();
		} else {
			teammatePlayerKeys = this.clientPlayerKeys();
		}

		for (let key of teammatePlayerKeys) {
			const teammate = this.getPlayerFromKey(key);

			if (teammate && key !== player.data.key) {
				this.addPlayerCanJumpOnBody(teammate, player.body);
				this.addPlayerCanJumpOnBody(player, teammate.body);
			}
		}
	}

	addPlayerCanJumpOnBody(player, body) {
		player.data.canJumpOnBodies.push(body);
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
		player.data.initialGravity = this.gameConfiguration.initialPlayerGravityScale();
		player.data.currentGravity = player.data.initialGravity;
		player.data.velocityXOnMove = this.gameConfiguration.playerXVelocity();
		player.data.velocityYOnJump = this.gameConfiguration.playerYVelocity();
		player.data.doingDropShot = false;
		player.data.playerCollisionGroup = playerCollisionGroup;
		player.data.lastBallHit = 0;
		player.data.numberBallHits = 0;
		//Bonus
		player.data.horizontalMoveModifier = () => {return 1;};
		player.data.verticalMoveModifier = () => {return 1;};
		player.data.isMoveReversed = false;
		player.data.isFrozen = false;
		player.data.canJump = true;
		player.data.alwaysJump = false;
		player.data.canJumpOnBodies = [];
		player.data.isInvincible = false;
		player.data.canActivateBonuses = true;
		player.data.initialIsHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		player.data.isHiddenToHimself = this.gameConfiguration.isHiddenToHimself();
		player.data.initialIsHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();
		player.data.isHiddenToOpponent = this.gameConfiguration.isHiddenToOpponent();

		this.initPlayerTexture(player);
		this.initPlayerPolygon(player);
		this.applyPlayerPolygon(player);

		if (player.data.isHiddenToHimself) {
			this.gameBonus.hidePlayingPlayer(player.data.key);
		}
		if (player.data.isHiddenToOpponent) {
			this.gameBonus.hideFromOpponent(player.data.key);
		}
	}

	initPlayerTexture(player) {
		player.data.initialTextureKey = 'shape-' + this.playerShapeFromKey(player.data.key);
		player.data.currentTextureKey = player.data.initialTextureKey;
	}

	initPlayerPolygon(player) {
		player.data.initialPolygonObject = 'player-' + this.gameData.getPlayerPolygonFromKey(player.data.key);
		player.data.currentPolygonObject = player.data.initialPolygonObject;
		player.data.initialPolygonKey = this.gameConfiguration.initialPlayerPolygonKey();
		player.data.currentPolygonKey = player.data.initialPolygonKey;
		player.data.initialScale = this.gameConfiguration.initialPlayerScale();
		this.engine.scale(player, player.data.initialScale, player.data.initialScale);
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
			player.data.isHost,
			player.data.currentPolygonKey,
			player.data.currentPolygonObject
		);
	}

	createBall(initialXLocation, initialYLocation) {
		this.ball = this.gameSkin.createBallComponent(this.engine, initialXLocation, initialYLocation);

		this.ball.data.initialGravity = this.gameConfiguration.initialBallGravityScale();
		this.ball.data.currentGravity = this.ball.data.initialGravity;
		this.ball.data.isFrozen = false;

		this.ball.data.initialPolygonObject = 'ball';
		this.ball.data.currentPolygonObject = this.ball.data.initialPolygonObject;
		this.ball.data.initialPolygonKey = this.gameConfiguration.initialBallPolygonKey();
		this.ball.data.currentPolygonKey = this.ball.data.initialPolygonKey;
		this.ball.data.initialScale = this.gameConfiguration.initialBallScale();
		this.engine.scale(this.ball, this.ball.data.initialScale, this.ball.data.initialScale);
		this.engine.loadPolygon(this.ball, this.ball.data.currentPolygonKey, this.ball.data.currentPolygonObject);

		this.setupBallBody();

		this.engine.limitBallThroughNet(this.ball);
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
		this.pauseGame();

		if (this.gameData.hasGameStatusEndedWithAWinner()) {
			this.onGameEnd();
		} else if (this.gameIsOnGoing()) {
			this.gameBonus.reset();
			this.resetPlayersAndBall();

			this.artificialIntelligence.startPoint();
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
				this.gameBonus.resumeGame();
				this.resumeGame();
			}, this);
			this.countdownTimer.start();
		} else {
			this.resumeGame();
		}
	}

	resetPlayersAndBall() {
		this.resetNumberBalHits();
		this.resetPlayer(this.player1);
		this.resetPlayer(this.player2);
		if (this.gameData.isTwoVersusTwo()) {
			this.resetPlayer(this.player3);
			this.resetPlayer(this.player4);
		}
		this.spawnBall();
	}

	resetNumberBalHits() {
		this.hostNumberBallHits = 0;
		this.clientNumberBallHits = 0;
	}

	resetPlayer(player) {
		this.resetPlayerBallHits(player);
		this.engine.spawn(player, player.data.initialXLocation, player.data.initialYLocation);
	}

	resetPlayerBallHits(player) {
		if (player) {
			player.data.numberBallHits = 0;
		}
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
		this.streamBundler.resetBundledStreams();

		for (let key of this.getPlayerKeys()) {
			const player = this.getPlayerFromKey(key);

			if (player) {
				this.engine.updatePlayerEye(player, this.ball);
			}
		}

		//Do not allow ball movement if it is frozen
		if (this.gameData.isUserCreator() && this.ball.data.isFrozen) {
			this.engine.setHorizontalSpeed(this.ball, 0);
			this.engine.setVerticalSpeed(this.ball, 0);
		}

		if (this.gameIsOnGoing()) {
			this.inputs();

			for (let key of this.getComputerPlayerKeys()) {
				const player = this.getPlayerFromKey(key);

				if (player) {
					this.moveComputer(player);
				}
			}

			this.engine.constrainVelocity(this.ball, 1000);

			if (this.gameData.hasBonuses) {
				this.gameBonus.onUpdateGameOnGoing();
			}

			this.updateCountdown();

			if (this.gameData.isUserCreator()) {
				this.sendBallPosition();
			}
		} else {
			this.stopGame();
			this.onGameEnd();
		}

		this.streamBundler.emitBundledStream(
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

		this.lastBallUpdate = this.streamBundler.addToBundledStreamsAtFrequence(
			this.lastBallUpdate,
			ballInterval,
			'moveClientBall',
			ballPositionData
		);
	}

	sendPlayerPosition(player) {
		let playerPositionData = this.engine.getPositionData(player);
		let playerInterval = PLAYER_INTERVAL;

		const key = player.data.key;
		playerPositionData.key = key;
		playerPositionData.doingDropShot = player.data.doingDropShot;

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

	hitBall(ball, player) {
		this.onBallHitPlayer(ball.sprite, player.sprite);
	}

	onBallHitPlayer(ball, player) {
		if (
			this.gameConfiguration.playerDropshotEnabled() &&
			this.isPlayerDoingDropShot(ball, player)
		) {
			this.dropShotBallOnPlayerHit(ball);
		} else {
			if (
				this.gameConfiguration.playerSmashEnabled() &&
				this.isPlayerSmashing(player, ball)
			) {
				this.smashBallOnPlayerHit(ball, player);
			} else if (
				this.gameConfiguration.ballReboundOnPlayerEnabled() &&
				!this.isBallBelowPlayer(ball, player)
			) {
				this.reboundBallOnPlayerHit(ball);
			}
		}

		this.engine.constrainVelocity(ball, 1000);

		this.incrementBallHitsOnBallHitPlayer(ball, player);
	}

	incrementBallHitsOnBallHitPlayer(ball, player) {
		//Threshold to avoid several calculations for the same "touch"
		if (
			(new Date()).getTime() - player.data.lastBallHit > 500 &&
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		) {
			player.data.lastBallHit = (new Date()).getTime();

			let playerNumberBallHits = ++player.data.numberBallHits;
			let teamNumberBallHits = 0;
			if (this.isPlayerHostSide(player)) {
				//Increment hit
				teamNumberBallHits = ++this.hostNumberBallHits;
				//Reset opponent
				this.clientNumberBallHits = 0;
			} else if (this.isPlayerClientSide(player)) {
				//Increment hit
				teamNumberBallHits = ++this.clientNumberBallHits;
				//Reset opponent
				this.hostNumberBallHits = 0;
			}

			//Reset other players
			this.resetPlayerNumberBallHitsForOthers(player);

			this.killPlayerOnBallHit(player, teamNumberBallHits, playerNumberBallHits);

			this.showTeamBallHitCount(ball, player, teamNumberBallHits);
		}
	}

	killPlayerOnBallHit(player, teamNumberBallHits, playerNumberBallHits) {
		if (
			this.gameConfiguration.overridesTeamMaximumBallHit() &&
			teamNumberBallHits > this.gameConfiguration.teamMaximumBallHit()
		) {
			//Kill the team
			if (this.isPlayerHostSide(player)) {
				setTimeout(() => {
					for (let key of this.hostPlayerKeys()) {
						this.gameBonus.killPlayer(key);
					}
				}, 100);
			} else if (this.isPlayerClientSide(player)) {
				setTimeout(() => {
					for (let key of this.clientPlayerKeys()) {
						this.gameBonus.killPlayer(key);
					}
				}, 100);
			}
		} else if (
			this.gameConfiguration.overridesPlayerMaximumBallHit() &&
			playerNumberBallHits > this.gameConfiguration.playerMaximumBallHit()
		) {
			setTimeout(() => {
				this.gameBonus.killPlayer(player.data.key);
			}, 100);
		}
	}

	showTeamBallHitCount(ball, player, teamNumberBallHits) {
		if (this.gameConfiguration.overridesTeamMaximumBallHit()) {
			const x = this.engine.getXPosition(ball);
			const y = this.engine.getYPosition(ball);
			const fontSize = '35px';
			let color = this.isPlayerHostSide(player) ? '#c94141' : '#3363a1';

			this.showBallHitCount(x, y, teamNumberBallHits, fontSize, color);

			//Send to client
			const serverTimestamp = this.serverNormalizedTime.getServerTimestamp();
			this.streamBundler.emitStream(
				'showBallHitCount-' + this.gameId,
				{
					x: x,
					y: y,
					ballHitCount: teamNumberBallHits,
					fontSize: fontSize,
					color: color
				},
				serverTimestamp
			);
		}
	}

	resetPlayerNumberBallHitsForOthers(player) {
		const playerKeys = [
			'player1',
			'player2',
			'player3',
			'player4'
		];

		for (let playerKey of playerKeys) {
			if (player.data.key !== playerKey) {
				this.resetPlayerBallHits(this.getPlayerFromKey(playerKey));
			}
		}
	}

	isPlayerSmashing(player, ball) {
		return (
			this.isPlayerJumpingForward(player) &&
			this.isBallInFrontOfPlayer(ball, player)
		);
	}

	isPlayerJumpingForward(player) {
		return (
			Math.round(this.engine.getVerticalSpeed(player)) < 0 &&
			!this.engine.hasSurfaceTouchingPlayerBottom(player) &&
			(
				(this.isPlayerHostSide(player) && Math.round(this.engine.getHorizontalSpeed(player)) > 0) ||
				(this.isPlayerClientSide(player) && Math.round(this.engine.getHorizontalSpeed(player)) < 0)
			)
		);
	}

	isBallInFrontOfPlayer(ball, player) {
		return (
			(this.isPlayerHostSide(player) && this.engine.getXPosition(player) < this.engine.getXPosition(ball)) ||
			(this.isPlayerClientSide(player) && this.engine.getXPosition(ball) < this.engine.getXPosition(player))
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

	smashBallOnPlayerHit(ball, player) {
		//Ball direction should change if smashed the opposite way
		if (this.ballMovingTowardsPlayer(ball, player)) {
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

	ballMovingTowardsPlayer(ball, player) {
		return (
			(this.isPlayerHostSide(player) && this.engine.getHorizontalSpeed(ball) < 0) ||
			(this.isPlayerClientSide(player) && this.engine.getHorizontalSpeed(ball) > 0)
		);
	}

	reboundBallOnPlayerHit(ball) {
		this.engine.setVerticalSpeed(ball, this.gameConfiguration.ballVelocityOnReboundOnPlayer());
	}

	canAddGamePoint() {
		return (
			this.gameResumed === true &&
			this.gameData.isUserCreator()
		);
	}

	canAddPointOnSide(side) {
		if (side === CLIENT_POINTS_COLUMN) {
			const hostPlayerKeys = this.hostPlayerKeys();

			for (let playerKey of hostPlayerKeys) {
				if (this.gameBonus.isInvincible(playerKey)) {
					return false;
				}
			}
		} else {
			const clientPlayerKeys = this.clientPlayerKeys();

			for (let playerKey of clientPlayerKeys) {
				if (this.gameBonus.isInvincible(playerKey)) {
					return false;
				}
			}
		}

		return true;
	}

	hitGround(ball) {
		let pointSide;

		if (ball.x < this.gameConfiguration.width() / 2) {
			pointSide = CLIENT_POINTS_COLUMN;
		} else {
			pointSide = HOST_POINTS_COLUMN;
		}

		if (this.canAddGamePoint() && this.canAddPointOnSide(pointSide)) {
			//Send to client
			this.streamBundler.emitStream(
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

			this.addGamePoint(pointSide);

			this.artificialIntelligence.stopPoint(pointSide);
		}
	}

	addGamePoint(pointSide) {
		this.gameResumed = false;

		Meteor.apply('addGamePoints', [this.gameId, pointSide], {noRetry: true}, () => {});
	}

	inputs() {
		const player = this.getCurrentPlayer();

		if (!player) {
			return false;
		}

		this.movePlayer(
			player,
			this.isLeftKeyDown(),
			this.isRightKeyDown(),
			this.isUpKeyDown(),
			this.isDropShotKeyDown()
		);

		return true;
	}

	moveComputer(player) {
		const key = player.data.key;

		//Creator user controls CPU
		if (!this.gameData.isUserCreator()) {
			return;
		}

		this.artificialIntelligence.computeMovement(
			key,
			player.data,
			this.engine.fullPositionData(player),
			this.engine.fullPositionData(this.ball),
			this.gameBonus.bonusesFullPositionData(),
			this.gameConfiguration,
			this.engine
		);

		this.movePlayer(
			player,
			this.artificialIntelligence.movesLeft(key),
			this.artificialIntelligence.movesRight(key),
			this.artificialIntelligence.jumps(key),
			this.artificialIntelligence.dropshots(key)
		);
	}

	movePlayer(player, movesLeft, movesRight, jumps, dropshots) {
		player.data.doingDropShot = false;

		if (player.data.isFrozen) {
			this.engine.setHorizontalSpeed(player, 0);
			this.engine.setVerticalSpeed(player, 0);
		} else {
			const horizontalMoveModifier = player.data.horizontalMoveModifier();
			const moveReversal = (player.data.isMoveReversed ? -1 : 1);

			if (movesLeft) {
				this.engine.setHorizontalSpeed(player, horizontalMoveModifier * moveReversal * -player.data.velocityXOnMove);
			} else if (movesRight) {
				this.engine.setHorizontalSpeed(player, horizontalMoveModifier * moveReversal * player.data.velocityXOnMove);
			} else {
				this.engine.setHorizontalSpeed(player, 0);
			}

			if (this.engine.hasSurfaceTouchingPlayerBottom(player)) {
				if (player.data.alwaysJump || (jumps && player.data.canJump)) {
					const verticalMoveModifier = player.data.verticalMoveModifier();

					this.engine.setVerticalSpeed(player, verticalMoveModifier * -player.data.velocityYOnJump);
				} else {
					this.engine.setVerticalSpeed(player, 0);
				}
			} else {
				player.data.doingDropShot = dropshots;
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

	moveClientPlayer(data) {
		let player = this.getPlayerFromKey(data.key);

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
		if (this.gameData.isTwoVersusTwo()) {
			this.engine.freeze(this.player3);
			this.engine.freeze(this.player4);
		}
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

	showBallHitCount(x, y, ballHitCount, fontSize, color) {
		this.engine.playCountAnimation(
			this.engine.addText(
				x,
				y,
				ballHitCount,
				{
					font: fontSize + " 'Oxygen Mono', sans-serif",
					fill: color,
					align: 'center'
				}
			)
		);
	}

	killPlayer(playerKey, killedAt) {
		if (killedAt > this.lastPointAt) {
			this.gameBonus.killAndRemovePlayer(playerKey);
		}
	}

	shakeLevel() {
		this.levelComponents.shake();
	}
};
