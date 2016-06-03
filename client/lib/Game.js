import BonusFactory from '/client/lib/game/BonusFactory.js';

export default class Game {

	constructor() {
		this.lastPlayerPositionData = {};
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

	getPlayer() {
		return Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
	}

	/**
	 * @param playerKey
	 * @returns string Returns the player shape or PLAYER_DEFAULT_SHAPE if no game nor player is found
	 */
	getPlayerShapeFromKey(playerKey) {
		var game = Games.findOne({_id: Session.get('game')}),
			player;

		if (!game) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		if (playerKey == 'player1') {
			player = Players.findOne({gameId: game._id, userId: game.createdBy});
		} else {
			player = Players.findOne({gameId: game._id, userId: {$ne: game.createdBy}});
		}

		if (!player) {
			return Constants.PLAYER_DEFAULT_SHAPE;
		}

		return player.shape;
	}

	isUserHost() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.createdBy === Meteor.userId());
	}

	isGameOnGoing() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.status === Constants.GAME_STATUS_STARTED);
	}

	isGameTimeOut() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.status === Constants.GAME_STATUS_TIMEOUT);
	}

	isGameFinished() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.status === Constants.GAME_STATUS_FINISHED);
	}

	getGameLastPointTaken() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.lastPointTaken);
	}

	hasGameBonuses() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.hasBonuses);
	}

	getWinnerName() {
		var game = Games.findOne({_id: Session.get('game')}),
			winnerName = 'Nobody',
			winner;

		if (game) {
			if (game.hostPoints >= Config.maximumPoints) {
				winner = Players.findOne({gameId: Session.get('game'), userId: game.createdBy});

				if (winner) {
					winnerName = winner.name;
				} else {
					winnerName = 'Player 1';
				}
			} else if (game.clientPoints >= Config.maximumPoints) {
				winner = Players.findOne({gameId: Session.get('game'), userId: {$ne: game.createdBy}});

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
		var game = Games.findOne({_id: Session.get('game')}),
			currentPlayerPosition = (game && game.createdBy === Meteor.userId()) ? 1 : 2,
			player = null;

		if (currentPlayerPosition == 1) {
			player = this.player1;
		} else if (currentPlayerPosition == 2) {
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
		this.game = new Phaser.Game({
			width: Config.xSize,
			height: Config.ySize,
			renderer: Phaser.CANVAS,
			parent: 'gameContainer'
		});
		this.game.state.add('play', {
			preload: this.preloadGame.bind(this),
			create: this.createGame.bind(this),
			update: this.updateGame.bind(this)
		});

		this.game.state.start('play');
	}

	stop() {
		this.game.state.destroy();
	}

	preloadGame() {
		this.game.stage.backgroundColor = '#9ad3de';
		this.game.stage.disableVisibilityChange = true;

		this.game.load.image('player1', 'assets/player-' + this.getPlayerShapeFromKey('player1') + '.png');
		this.game.load.image('player2', 'assets/player-' + this.getPlayerShapeFromKey('player2') + '.png');
		this.game.load.image('ball', 'assets/ball.png');
		this.game.load.image('net', 'assets/net.png');
		this.game.load.image('ground', 'assets/ground.png');

		this.game.load.image('delimiter', 'assets/clear.png');
		this.game.load.physics(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json');
	}

	loadScaledPhysics(originalPhysicsKey, newPhysicsKey, shapeKey, scale) {
		var newData = [],
			data = this.game.cache.getPhysicsData(originalPhysicsKey, shapeKey);

		for (let i = 0; i < data.length; i++) {
			let vertices = [];
			for (let j = 0; j < data[i].shape.length; j += 2) {
				vertices[j] = data[i].shape[j] * scale;
				vertices[j + 1] = data[i].shape[j + 1] * scale;
			}
			newData.push({shape: vertices});
		}

		let item = {};
		if (this.game.cache.checkKey(Phaser.Cache.PHYSICS, newPhysicsKey)) {
			item = this.game.cache.getPhysicsData(newPhysicsKey);
		}

		item[shapeKey] = newData;
		this.game.load.physics(newPhysicsKey, '', item);
	}

	createGame() {
		var initialXLocation = Config.playerInitialLocation,
			initialYLocation = Config.ySize - Config.groundHeight - (Config.playerHeight / 2);

		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'player-' + this.getPlayerShapeFromKey('player1'), Constants.SMALL_SCALE_PLAYER_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'player-' + this.getPlayerShapeFromKey('player2'), Constants.SMALL_SCALE_PLAYER_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'player-' + this.getPlayerShapeFromKey('player1'), Constants.BIG_SCALE_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'player-' + this.getPlayerShapeFromKey('player2'), Constants.BIG_SCALE_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.SMALL_SCALE_PHYSICS_DATA, 'ball', Constants.SMALL_SCALE_BALL_BONUS);
		this.loadScaledPhysics(Constants.NORMAL_SCALE_PHYSICS_DATA, Constants.BIG_SCALE_PHYSICS_DATA, 'ball', Constants.BIG_SCALE_BONUS);

		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.setImpactEvents(true);
		this.game.physics.p2.gravity.y = Config.worldGravity;
		this.game.physics.p2.world.defaultContactMaterial.friction = 0;
		this.game.physics.p2.world.setGlobalStiffness(1e10);
		this.game.physics.p2.restitution = 0;

		this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.ballCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.bonusCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.playerDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.groundHitDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();

		this.game.physics.p2.updateBoundsCollisionGroup();

		this.worldMaterial = this.game.physics.p2.createMaterial('world');
		this.playerMaterial = this.game.physics.p2.createMaterial('player');
		this.ballMaterial = this.game.physics.p2.createMaterial('ball');
		this.bonusMaterial = this.game.physics.p2.createMaterial('bonus');
		this.playerDelimiterMaterial = this.game.physics.p2.createMaterial('netPlayerDelimiter');
		this.netDelimiterMaterial = this.game.physics.p2.createMaterial('netDelimiter');
		this.groundDelimiterMaterial = this.game.physics.p2.createMaterial('groundDelimiter');

		this.game.physics.p2.setWorldMaterial(this.worldMaterial);

		/**
		 * Player 1
		 */
		this.player1 = this.game.add.sprite(initialXLocation, initialYLocation, 'player1');
		this.createPlayer(this.player1, initialXLocation, initialYLocation, 'player1');

		/**
		 * Player 2
		 */
		initialXLocation = Config.xSize - Config.playerInitialLocation;
		this.player2 = this.game.add.sprite(initialXLocation, initialYLocation, 'player2');
		this.createPlayer(this.player2, initialXLocation, initialYLocation, 'player2');

		/**
		 * Ball
		 */
		this.createBall();

		/**
		 * Contact materials
		 */
		this.game.physics.p2.createContactMaterial(this.ballMaterial, this.worldMaterial, {restitution: 1});
		this.game.physics.p2.createContactMaterial(this.ballMaterial, this.groundDelimiterMaterial, {restitution: 1});

		this.game.physics.p2.createContactMaterial(this.bonusMaterial, this.worldMaterial, {restitution: 1});
		this.game.physics.p2.createContactMaterial(this.bonusMaterial, this.netDelimiterMaterial, {restitution: 0.75});
		this.game.physics.p2.createContactMaterial(this.bonusMaterial, this.groundDelimiterMaterial, {restitution: 1});

		this.game.physics.p2.createContactMaterial(this.playerMaterial, this.worldMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});
		this.game.physics.p2.createContactMaterial(this.playerMaterial, this.playerDelimiterMaterial, {stiffness: 1e20, relaxation: 3, friction: 0});

		this.loadLevel();

		/**
		 * Winner text
		 */
		this.informationText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, '', {
			font: '40px Oxygen, sans-serif',
			fill: '#363636',
			align: 'center'
		});
		this.informationText.anchor.set(0.5);

		/**
		 * Countdown text
		 */
		this.countdownText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, '', {
			font: "125px 'Oxygen Mono', sans-serif",
			fill: '#363636',
			align: 'center'
		});
		this.countdownText.anchor.set(0.5);

		this.cursor = this.game.input.keyboard.createCursorKeys();
		this.game.input.keyboard.addKeyCapture([
			Phaser.Keyboard.UP, Phaser.Keyboard.DOWN, Phaser.Keyboard.RIGHT, Phaser.Keyboard.LEFT
		]);

		this.resumeOnTimerEnd();
	}

	createPlayer(player, initialXLocation, initialYLocation, playerKey) {
		player.initialXLocation = initialXLocation;
		player.initialYLocation = initialYLocation;
		player.leftMoveModifier = -1;
		player.rightMoveModifier = 1;
		player.velocityXOnMove = Config.playerVelocityXOnMove;
		player.velocityYOnJump = Config.playerVelocityYOnJump;
		player.canMove = true;
		player.canJump = true;

		this.game.physics.p2.enable(player);
		player.polygonObject = 'player-' + this.getPlayerShapeFromKey(playerKey);
		player.body.clearShapes();
		player.body.loadPolygon(Constants.NORMAL_SCALE_PHYSICS_DATA, player.polygonObject);

		this.setupPlayerBody(player);
	}

	setupPlayerBody(player) {
		player.body.fixedRotation = true;
		player.body.mass = Config.playerMass;
		player.body.data.gravityScale = Config.playerGravityScale;

		player.body.setMaterial(this.playerMaterial);
		player.body.setCollisionGroup(this.playerCollisionGroup);

		player.body.collides(this.playerDelimiterCollisionGroup);
		player.body.collides(this.ballCollisionGroup);
		player.body.collides(this.bonusCollisionGroup);
	}

	scalePlayer(playerKey, scale) {
		var player = this.getPlayerFromKey(playerKey),
			polygonKey = this.getPolygonKeyFromScale(scale);

		if (!player || !polygonKey) {
			return;
		}

		player.scale.setTo(scale, scale);
		player.body.clearShapes();
		player.body.loadPolygon(polygonKey, player.polygonObject);
		this.setupPlayerBody(player);
	}

	resetPlayerScale(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		this.scalePlayer(playerKey, 1);
	}

	changePlayerProperty(playerKey, property, value) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player[property] = value;
	}

	freezePlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.body.mass = 2000;
		this.freezeBody(player.body);
	}

	unFreezePlayer(playerKey) {
		var player = this.getPlayerFromKey(playerKey);

		if (!player) {
			return;
		}

		player.body.mass = Config.playerMass;
		player.body.data.gravityScale = Config.playerGravityScale;
	}

	createBall() {
		this.ball = this.game.add.sprite(Config.playerInitialLocation, Config.ySize - Config.groundHeight - Config.ballDistanceFromGround, 'ball');

		this.game.physics.p2.enable(this.ball);
		this.ball.polygonObject = 'ball';
		this.ball.body.clearShapes();
		this.ball.body.loadPolygon(Constants.NORMAL_SCALE_PHYSICS_DATA, 'ball');

		this.setupBallBody();
	}

	setupBallBody() {
		this.ball.body.fixedRotation = true;
		this.ball.body.data.gravityScale = Config.ballGravityScale;
		this.ball.body.damping = 0.1;
		this.ball.body.setMaterial(this.ballMaterial);
		this.ball.body.setCollisionGroup(this.ballCollisionGroup);

		this.ball.body.collides(this.playerCollisionGroup, this.hitBall, this);
		this.ball.body.collides(this.netHitDelimiterCollisionGroup);
		this.ball.body.collides(this.groundHitDelimiterCollisionGroup, this.hitGround, this);
		this.ball.body.collides(this.bonusCollisionGroup);
	}

	scaleBall(scale) {
		var polygonKey = this.getPolygonKeyFromScale(scale);

		if (!polygonKey) {
			return;
		}

		this.ball.scale.setTo(scale, scale);
		this.ball.body.clearShapes();
		this.ball.body.loadPolygon(polygonKey, this.ball.polygonObject);
		this.setupBallBody();
	}

	resetBallScale() {
		this.scaleBall(Constants.NORMAL_SCALE_BONUS);
	}

	freezeBody(body) {
		body.setZeroRotation();
		body.setZeroVelocity();
		body.data.gravityScale = 0;
	}

	resumeOnTimerEnd() {
		this.resetAllBonuses();
		this.pauseGame();

		this.spawnPlayer(this.player1);
		this.spawnPlayer(this.player2);
		this.spawnBall();

		if (this.isGameFinished()) {
			this.setInformationText(this.getWinnerName() + ' wins!');
		} else if (this.isGameOnGoing()) {
			this.lastPlayerPositionData = {};
			this.countdownTimer = this.game.time.create();
			this.countdownTimer.add(Phaser.Timer.SECOND * 3, this.resumeGame, this);
			this.countdownTimer.start();
			this.generateBonusActivationAndFrequenceTime();
			this.lastGameRespawn = this.game.time.time;
		}
	}

	loadLevel() {
		var groupItem;

		/**
		 * Level look
		 */
		this.level = this.game.add.group();
		this.level.enableBody = true;

		//Ground
		this.game.add.tileSprite(
			0,
			Config.ySize - Config.groundHeight,
			Config.xSize,
			Config.groundHeight,
			'ground',
			0,
			this.level
		);

		//Net
		this.game.add.tileSprite(
			(Config.xSize / 2) - (Config.netThickness / 2),
			Config.ySize - Config.groundHeight - Config.netHeight,
			Config.netThickness,
			Config.netHeight,
			'net',
			0,
			this.level
		);

		this.level.setAll('body.immovable', true);

		/**
		 * Player ground delimiter
		 */
		//Ground
		groupItem = this.game.add.tileSprite(
			Config.xSize / 2,
			Config.ySize - (Config.groundHeight / 2),
			Config.xSize,
			Config.groundHeight,
			'delimiter'
		);

		this.game.physics.p2.enable(groupItem);
		groupItem.body.static = true;
		groupItem.body.setMaterial(this.playerDelimiterMaterial);
		groupItem.body.setCollisionGroup(this.playerDelimiterCollisionGroup);
		groupItem.body.collides(this.playerCollisionGroup);

		/**
		 * Player net delimiter
		 */
		//Net
		groupItem = this.game.add.tileSprite(
			(Config.xSize / 2),
			(Config.ySize / 2),
			Config.netThickness,
			Config.ySize,
			'delimiter'
		);

		this.game.physics.p2.enable(groupItem);
		groupItem.body.static = true;
		groupItem.body.setMaterial(this.playerDelimiterMaterial);
		groupItem.body.setCollisionGroup(this.playerDelimiterCollisionGroup);
		groupItem.body.collides(this.playerCollisionGroup);

		/**
		 * Ball Net hit delimiter
		 */
		//Net
		groupItem = this.game.add.tileSprite(
			(Config.xSize / 2),
			Config.ySize - Config.groundHeight - (Config.netHeight / 2),
			Config.netThickness,
			Config.netHeight,
			'delimiter'
		);

		this.game.physics.p2.enable(groupItem);
		groupItem.body.static = true;
		groupItem.body.setMaterial(this.netDelimiterMaterial);
		groupItem.body.setCollisionGroup(this.netHitDelimiterCollisionGroup);
		groupItem.body.collides(this.ballCollisionGroup);
		groupItem.body.collides(this.bonusCollisionGroup);

		/**
		 * Ball Ground hit delimiter
		 */
		//Ground
		groupItem = this.game.add.tileSprite(
			Config.xSize / 2,
			Config.ySize - (Config.groundHeight / 2),
			Config.xSize,
			Config.groundHeight,
			'delimiter'
		);

		this.game.physics.p2.enable(groupItem);
		groupItem.body.static = true;
		groupItem.body.setMaterial(this.groundDelimiterMaterial);
		groupItem.body.setCollisionGroup(this.groundHitDelimiterCollisionGroup);
		groupItem.body.collides(this.ballCollisionGroup);
		groupItem.body.collides(this.bonusCollisionGroup);
	}

	spawnPlayer(player) {
		player.scale.setTo(0, 0);
		this.game.add.tween(player.scale).to({x: 1, y: 1}, 300).start();
		player.reset(player.initialXLocation, player.initialYLocation);
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

		this.ball.body.setZeroVelocity();
		this.ball.reset(
			xBallPosition,
			Config.ySize - Config.groundHeight - Config.ballDistanceFromGround
		);

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

			/**
			 * Update timer
			 */
			if (this.countdownTimer && this.countdownTimer.running) {
				this.countdownText.text = Math.ceil(this.countdownTimer.duration / 1000);

				//Zoom numbers
				if (this.countdownText.text != this.lastCountdownNumber) {
					this.countdownText.scale.setTo(1, 1);
					this.countdownText.alpha = 1;
					this.countdownText.smoothed = true;
					this.game.add.tween(this.countdownText.scale).to({x: 5, y: 5}, 500, Phaser.Easing.Linear.None, true);
					this.game.add.tween(this.countdownText).to({alpha: 0}, 500, Phaser.Easing.Linear.None, true);
				}

				this.lastCountdownNumber = this.countdownText.text;
			}

			//Send ball position to database only if it has changed
			if (this.isUserHost()) {
				let ballPositionData = this.getBodyPositionData(this.ball.body);

				this.lastBallUpdate = this.emitGameStreamAtFrequence(
					this.lastBallUpdate,
					Config.ballInterval,
					'moveClientBall-' + Session.get('game'),
					[ballPositionData]
				);

				if (this.hasGameBonuses()) {
					this.createBonusIfTimeHasElapsed();

					if (this.bonus) {
						let bonusPositionData = this.getBodyPositionData(this.bonus.body);

						this.lastBonusUpdate = this.emitGameStreamAtFrequence(
							this.lastBonusUpdate,
							Config.bonusInterval,
							'moveClientBonus-' + Session.get('game'),
							[bonusPositionData]
						);
					}
				}
			}
		} else if (this.isGameTimeOut()) {
			this.freezeBody(this.player1.body);
			this.freezeBody(this.player2.body);
			this.freezeBody(this.ball.body);

			if (this.bonus) {
				this.freezeBody(this.bonus.body);
			}

			this.setInformationText('The game has timed out...');
		}
	}

	hitBall(ball, player) {
		var key = player.sprite.key;

		//Player is jumping forward and ball is in front of him (smash)
		if (
			Math.round(player.velocity.y) < 0 &&
			(
				(key === 'player1' && Math.round(player.velocity.x) > 0 && player.x < ball.x) ||
				(key === 'player2' && Math.round(player.velocity.x) < 0 && ball.x < player.x
				)
			)
		) {
			//Ball should go faster and down
			ball.velocity.x *= 2;
			ball.velocity.y /= 4;

			//Ball should always go down
			if (ball.velocity.y < 0) {
				ball.velocity.y = -ball.velocity.y;
			}

			this.constrainVelocity(ball, 1000);
		} else {
			//Ball rebounds on player
			ball.velocity.y = -Config.ballVelocityYOnPlayerHit;
		}
	}

	constrainVelocity(body, maxVelocity) {
		var angle, currVelocitySqr, vx, vy;
		vx = body.velocity.x;
		vy = body.velocity.y;
		currVelocitySqr = vx * vx + vy * vy;
		if (currVelocitySqr > maxVelocity * maxVelocity) {
			angle = Math.atan2(vy, vx);
			vx = Math.cos(angle) * maxVelocity;
			vy = Math.sin(angle) * maxVelocity;
			body.velocity.x = vx;
			body.velocity.y = vy;
		}
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

		if (!player || !player.canMove) {
			return;
		}

		if (this.cursor.left.isDown) {
			player.body.velocity.x = player.leftMoveModifier * player.velocityXOnMove;
		} else if (this.cursor.right.isDown) {
			player.body.velocity.x = player.rightMoveModifier * player.velocityXOnMove;
		} else {
			player.body.velocity.x = 0;
		}

		if (this.isPlayerAtGroundLevel(player)) {
			if (this.cursor.up.isDown && player.canJump) {
				player.body.velocity.y = -player.velocityYOnJump;
			} else {
				player.body.velocity.y = 0;
			}
		}

		//Send player position to database only if it has changed
		let playerPositionData = this.getBodyPositionData(player.body);
		if (JSON.stringify(this.lastPlayerPositionData) !== JSON.stringify(playerPositionData)) {
			let lastPlayerUpdateBefore = this.lastPlayerUpdate;

			this.lastPlayerUpdate = this.emitGameStreamAtFrequence(
				this.lastPlayerUpdate,
				Config.playerInterval,
				'moveOppositePlayer-' + Session.get('game'),
				[this.isUserHost(), playerPositionData]
			);

			//The position has been sent to the server
			if (lastPlayerUpdateBefore != this.lastPlayerUpdate) {
				this.lastPlayerPositionData = playerPositionData;
			}
		}
	}

	isPlayerAtGroundLevel(player) {
		return (player.bottom >= Config.ySize - Config.groundHeight);
	}

	getBodyPositionData(body) {
		return {
			x: body.x,
			y: body.y,
			velocityX: body.velocity.x,
			velocityY: body.velocity.y
		};
	}

	moveOppositePlayer(data) {
		var player;

		if (this.isUserHost()) {
			player = this.player2;
		} else {
			player = this.player1;
		}

		if (!player || !player.body) {
			return;
		}

		player.body.x = data.x;
		player.body.y = data.y;
		player.body.velocity.x = data.velocityX;
		player.body.velocity.y = data.velocityY;
	}

	moveClientBall(data) {
		if (!this.ball || !this.ball.body) {
			return;
		}

		this.ball.body.x = data.x;
		this.ball.body.y = data.y;
		this.ball.body.velocity.x = data.velocityX;
		this.ball.body.velocity.y = data.velocityY;
	}

	moveClientBonus(data) {
		if (!this.bonus || !this.bonus.body) {
			return;
		}

		this.bonus.body.x = data.x;
		this.bonus.body.y = data.y;
		this.bonus.body.velocity.x = data.velocityX;
		this.bonus.body.velocity.y = data.velocityY;
	}

	shakeLevel() {
		var move = 5,
			time = 20;

		this.game.add.tween(this.level)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move}, time).to({y: "+" + move * 2}, time * 2).to({y: "-" + move}, time)
			.to({y: "-" + move / 2}, time).to({y: "+" + move}, time * 2).to({y: "-" + move / 2}, time)
			.start();

		this.game.add.tween(this.level)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move}, time).to({x: "+" + move * 2}, time * 2).to({x: "-" + move}, time)
			.to({x: "-" + move / 2}, time).to({x: "+" + move}, time * 2).to({x: "-" + move / 2}, time)
			.start();
	}

	pauseGame() {
		//Freeze ball
		this.freezeBody(this.ball.body);
	}

	resumeGame() {
		this.ball.body.data.gravityScale = Config.ballGravityScale;

		this.countdownText.text = '';
		this.countdownTimer.stop();
	}

	setInformationText(text) {
		var multilineText = text;

		if (!Array.isArray(multilineText)) {
			multilineText = [multilineText];
		}

		multilineText = multilineText.map(line => {return '    ' + line + '    ';});

		this.informationText.text = multilineText.join('\n');
	}

	callMeteorMethodAtFrequence(lastCallTime, frequenceTime, methodToCall, argumentsToCallWith) {
		if (this.game.time.time - lastCallTime >= frequenceTime) {
			Meteor.apply(methodToCall, argumentsToCallWith);

			lastCallTime = this.game.time.time;
		}

		return lastCallTime;
	}

	emitGameStreamAtFrequence(lastCallTime, frequenceTime, streamToEmit, argumentsToEmitWith) {
		if (this.game.time.time - lastCallTime >= frequenceTime) {
			GameStream.emit.apply(this, [streamToEmit].concat(argumentsToEmitWith));

			lastCallTime = this.game.time.time;
		}

		return lastCallTime;
	}

	generateBonusActivationAndFrequenceTime() {
		this.lastBonusActivated = this.game.time.time;
		this.bonusFrequenceTime = getRandomInt(Config.bonusMinimumInterval, Config.bonusMaximumInterval);
	}

	createBonusIfTimeHasElapsed() {
		var frequenceTime = this.bonusFrequenceTime - Math.round((this.game.time.time - this.lastGameRespawn) / 25);

		if (frequenceTime < 0) {
			frequenceTime = 0;
		}

		//Only one bonus sprite at the same time
		if (this.bonus === null && this.game.time.time - this.lastBonusActivated >= frequenceTime) {
			//Host choose position and bonusCls
			let data = {
				initialX: Config.xSize / 2 + Random.choice([-5, +5]),
				bonusKey: Random.choice([
					Constants.BONUS_SMALL_BALL,
					Constants.BONUS_BIG_BALL,
					Constants.BONUS_SMALL_MONSTER,
					Constants.BONUS_BIG_MONSTER,
					Constants.BONUS_BIG_JUMP_MONSTER,
					Constants.BONUS_SLOW_MONSTER,
					Constants.BONUS_FAST_MONSTER,
					Constants.BONUS_FREEZE_MONSTER,
					Constants.BONUS_REVERSE_MOVE_MONSTER
				])
			};

			//Create the bonus the host
			this.createBonus(data);
			//Send to client
			GameStream.emit('createBonus-' + Session.get('game'), data);
		}
	}

	createBonus(data) {
		var bonus = BonusFactory.getInstance(data.bonusKey, this);

		this.bonus = this.game.add.sprite(data.initialX, 0, 'delimiter');

		let bonusGraphics = this.game.add.graphics(0, 0);

		bonusGraphics.beginFill(bonus.getColor());
		bonusGraphics.drawCircle(0, 0, 30);
		bonusGraphics.endFill();

		bonusGraphics.beginFill(0xFFFFFF);
		bonusGraphics.drawCircle(0, 0, 27);
		bonusGraphics.endFill();

		let bonusText = this.game.add.text(0, 3, bonus.getLetter(), {
			font: 'FontAwesome',
			fontWeight: 'normal',
			fontSize: '16px',
			fill: '#363636',
			align: 'center'
		});
		bonusText.anchor.set(0.5);

		this.game.physics.p2.enable(this.bonus);
		this.bonus.body.clearShapes();
		this.bonus.body.addCircle(15);
		this.bonus.body.fixedRotation = false;
		this.bonus.body.data.gravityScale = Config.bonusGravityScale;
		this.bonus.body.damping = 0;
		this.bonus.body.setMaterial(this.bonusMaterial);
		this.bonus.body.setCollisionGroup(this.bonusCollisionGroup);
		this.bonus.bonus = bonus;

		this.bonus.addChild(bonusGraphics);
		this.bonus.addChild(bonusText);

		this.bonus.body.collides(this.playerCollisionGroup, (bonusItem, player) => {
			if (this.isUserHost()) {
				//Activate bonus
				this.activateBonus(player.sprite.key);
				this.generateBonusActivationAndFrequenceTime();
				//Send to client
				GameStream.emit('activateBonus-' + Session.get('game'), player.sprite.key);
			}
		}, this);
		this.bonus.body.collides(this.netHitDelimiterCollisionGroup);
		this.bonus.body.collides(this.groundHitDelimiterCollisionGroup);
		this.bonus.body.collides(this.ballCollisionGroup);
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
