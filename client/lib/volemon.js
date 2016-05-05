Volemon = class Volemon {

	constructor() {
		this.lastBallPositionData = {};
		this.lastPlayerPositionData = {};
		this.lastKeepAliveUpdate = 0;
		this.lastBallUpdate = 0;
		this.lastPlayerUpdate = 0;
		this.lastBallTimestampRead = 0;
		this.lastPlayerTimestampRead = 0;
	}

	getPlayer() {
		return Players.findOne({gameId: Session.get('game'), userId: Meteor.userId()});
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

	getGameBallData() {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game.ballData);
	}

	getGamePlayerData(playerColumn) {
		var game = Games.findOne({_id: Session.get('game')});

		return (game && game[playerColumn]);
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

		this.game.load.image('player1', 'assets/player.png');
		this.game.load.image('player2', 'assets/player.png');
		this.game.load.image('ball', 'assets/ball.png');
		this.game.load.image('net', 'assets/net.png');
		this.game.load.image('ground', 'assets/ground.png');

		this.game.load.image('delimiter', 'assets/clear.png');
		this.game.load.physics('physicsData', 'assets/physicsData.json');
	}

	createGame() {
		var initialXLocation = Config.playerInitialLocation,
			initialYLocation = Config.ySize - Config.groundHeight - (Config.playerHeight / 2);

		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.setImpactEvents(true);
		this.game.physics.p2.gravity.y = Config.worldGravity;
		this.game.physics.p2.world.defaultContactMaterial.friction = 0;
		this.game.physics.p2.world.setGlobalStiffness(1e10);
		this.game.physics.p2.restitution = 0;

		this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.ballCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.playerDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.netHitDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();
		this.groundHitDelimiterCollisionGroup = this.game.physics.p2.createCollisionGroup();

		this.game.physics.p2.updateBoundsCollisionGroup();

		this.worldMaterial = this.game.physics.p2.createMaterial('world');
		this.playerMaterial = this.game.physics.p2.createMaterial('player');
		this.ballMaterial = this.game.physics.p2.createMaterial('ball');
		this.netPlayerDelimiterMaterial = this.game.physics.p2.createMaterial('netPlayerDelimiter');

		this.game.physics.p2.setWorldMaterial(this.worldMaterial);

		/**
		 * Player 1
		 */
		this.player1 = this.game.add.sprite(initialXLocation, initialYLocation, 'player1');
		this.createPlayer(this.player1, initialXLocation, initialYLocation);

		/**
		 * Player 2
		 */
		initialXLocation = Config.xSize - Config.playerInitialLocation;
		this.player2 = this.game.add.sprite(initialXLocation, initialYLocation, 'player2');
		this.createPlayer(this.player2, initialXLocation, initialYLocation);

		/**
		 * Ball
		 */
		this.createBall();

		/**
		 * Contact materials
		 */
		this.game.physics.p2.createContactMaterial(this.ballMaterial, this.worldMaterial, {restitution: 1});

		this.game.physics.p2.createContactMaterial(this.playerMaterial, this.worldMaterial, {
			restitution: 0, stiffness: 1e20, relaxation: 1000, friction: 0
		});
		this.game.physics.p2.createContactMaterial(this.playerMaterial, this.netPlayerDelimiterMaterial, {
			restitution: 0, stiffness: 1e20, relaxation: 1000, friction: 0
		});

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

	createPlayer(player, initialXLocation, initialYLocation) {
		player.initialXLocation = initialXLocation;
		player.initialYLocation = initialYLocation;

		this.game.physics.p2.enable(player);
		player.body.clearShapes();
		player.body.loadPolygon('physicsData', 'player');
		player.body.fixedRotation = true;
		player.body.mass = 200;
		player.body.data.gravityScale = Config.playerGravityScale;
		player.body.setMaterial(this.playerMaterial);
		player.body.setCollisionGroup(this.playerCollisionGroup);

		player.body.collides(this.playerDelimiterCollisionGroup);
		player.body.collides(this.ballCollisionGroup);
	}

	createBall() {
		this.ball = this.game.add.sprite(Config.playerInitialLocation, Config.ySize - Config.groundHeight - Config.ballDistanceFromGround, 'ball');

		this.game.physics.p2.enable(this.ball);
		this.ball.body.setCircle(Config.ballRadius);
		this.ball.body.data.gravityScale = Config.ballGravityScale;
		this.ball.body.damping = 0;
		this.ball.body.setMaterial(this.ballMaterial);
		this.ball.body.setCollisionGroup(this.ballCollisionGroup);

		this.ball.body.collides(this.playerCollisionGroup, this.hitBall, this);
		this.ball.body.collides(this.netHitDelimiterCollisionGroup);
		this.ball.body.collides(this.groundHitDelimiterCollisionGroup, this.hitGround, this);
	}

	resumeOnTimerEnd() {
		this.pauseGame();

		this.spawnPlayer(this.player1);
		this.spawnPlayer(this.player2);
		this.spawnBall();

		if (this.isGameFinished()) {
			this.setInformationText(this.getWinnerName() + ' wins!');
		} else if (this.isGameOnGoing()) {
			this.countdownTimer = this.game.time.create();
			this.countdownTimer.add(Phaser.Timer.SECOND * 3, this.resumeGame, this);
			this.countdownTimer.start();
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
		groupItem.body.setCollisionGroup(this.playerDelimiterCollisionGroup);
		groupItem.body.collides(this.playerCollisionGroup);

		/**
		 * Player net delimiter
		 */
		//Net
		groupItem = this.game.add.tileSprite(
			(Config.xSize / 2),
			(Config.ySize - Config.groundHeight) / 2,
			Config.netThickness,
			Config.ySize - Config.groundHeight,
			'delimiter'
		);

		this.game.physics.p2.enable(groupItem);
		groupItem.body.static = true;
		groupItem.body.setMaterial(this.netPlayerDelimiterMaterial);
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
		groupItem.body.setCollisionGroup(this.netHitDelimiterCollisionGroup);
		groupItem.body.collides(this.ballCollisionGroup);

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
		groupItem.body.setCollisionGroup(this.groundHitDelimiterCollisionGroup);
		groupItem.body.collides(this.ballCollisionGroup);
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
			this.moveOppositePlayer();

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
				let ballPositionData = this.getBallPositionData();
				if (JSON.stringify(this.lastBallPositionData) !== JSON.stringify(ballPositionData)) {
					let lastBallUpdateBefore = this.lastBallUpdate;
					this.lastBallUpdate = this.callMeteorMethodAtFrequence(
						this.lastBallUpdate, Config.ballInterval, 'updateBallPosition', [Session.get('game'), ballPositionData]
					);

					//The position has been sent to the server
					if (lastBallUpdateBefore != this.lastBallUpdate) {
						this.lastBallPositionData = ballPositionData;
					}
				}
			} else {
				this.moveClientBall();
			}
		} else if (this.isGameTimeOut()) {
			this.player1.body.setZeroVelocity();
			this.player1.body.data.gravityScale = 0;
			this.player2.body.setZeroVelocity();
			this.player2.body.data.gravityScale = 0;
			this.ball.body.setZeroVelocity();
			this.ball.body.data.gravityScale = 0;

			this.setInformationText('The game has timed out...');
		}
	}

	callMeteorMethodAtFrequence(lastCallTime, frequenceTime, methodToCall, argumentsToCallWith) {
		if (this.game.time.time - lastCallTime >= frequenceTime) {
			Meteor.apply(methodToCall, argumentsToCallWith);

			lastCallTime = this.game.time.time;
		}

		return lastCallTime;
	}

	hitBall(ball, player) {
		var key = player.sprite.key;

		if (
			Math.round(player.velocity.y) < 0 &&
			(
				(key === 'player1' && player.velocity.x > 0) ||
				(key === 'player2' && player.velocity.x < 0)
			)
		) {
			//Player is jumping forward (smashing)
			//Ball should go faster and down
			ball.velocity.x *= 2;
			ball.velocity.y /= 4;

			//Ball should always go down
			if (ball.velocity.y < 0) {
				ball.velocity.y = -ball.velocity.y;
			}
		} else {
			ball.velocity.y = -Config.ballVelocityYOnPlayerHit;
		}
	}

	hitGround(ball, ground) {
		if (this.isUserHost()) {
			let pointSide;

			if (ball.x < Config.xSize / 2) {
				pointSide = Constants.CLIENT_POINTS_COLUMN;
			} else {
				pointSide = Constants.HOST_POINTS_COLUMN;
			}

			Meteor.call('addGamePoints', Session.get('game'), pointSide, () => {
				this.shakeLevel();
				this.resumeOnTimerEnd();

				//The socket will tell the client when to shake and respawn to resume in sync
				GameStream.emit('shakeLevelAndResumeOnTimerEnd', Session.get('game'));
			});
		}
	}

	inputs() {
		var player = this.getCurrentPlayer();

		if (!player) {
			return;
		}

		if (this.cursor.left.isDown) {
			player.body.velocity.x = -Config.playerVelocityXOnMove;
		} else if (this.cursor.right.isDown) {
			player.body.velocity.x = Config.playerVelocityXOnMove;
		} else {
			player.body.velocity.x = 0;
		}

		if (this.isPlayerAtGroundLevel(player)) {
			if (this.cursor.up.isDown) {
				player.body.velocity.y = -Config.playerVelocityYOnJump;
			} else {
				player.body.velocity.y = 0;
			}
		}

		//Send player position to database only if it has changed
		let playerPositionData = this.getPlayerPositionData(player);
		if (JSON.stringify(this.lastPlayerPositionData) !== JSON.stringify(playerPositionData)) {
			let lastPlayerUpdateBefore = this.lastPlayerUpdate;
			this.lastPlayerUpdate = this.callMeteorMethodAtFrequence(
				this.lastPlayerUpdate,
				Config.playerInterval,
				'updatePlayerPosition',
				[
					Session.get('game'),
					(this.isUserHost() ? Constants.HOST_PLAYER_DATA_COLUMN : Constants.CLIENT_PLAYER_DATA_COLUMN),
					playerPositionData
				]
			);

			//The position has been sent to the server
			if (lastPlayerUpdateBefore != this.lastPlayerUpdate) {
				this.lastPlayerPositionData = playerPositionData;
			}
		}
	}

	isPlayerAtGroundLevel(player) {
		return (player.y + (Config.playerHeight / 2) >= Config.ySize - Config.groundHeight);
	}

	moveOppositePlayer() {
		var player, playerColumn;

		if (this.isUserHost()) {
			player = this.player2;
			playerColumn = Constants.CLIENT_PLAYER_DATA_COLUMN;
		} else {
			player = this.player1;
			playerColumn = Constants.HOST_PLAYER_DATA_COLUMN;
		}

		if (!player || !player.body) {
			return;
		}

		let data = this.getGamePlayerData(playerColumn);
		if (data && data.timestamp != this.lastPlayerTimestampRead) {
			player.body.x = data.x;
			player.body.y = data.y;
			player.body.velocity.x = data.velocityX;
			player.body.velocity.y = data.velocityY;

			//This is used for interpolation in addition with velocities
			this.lastPlayerTimestampRead = data.timestamp;
		}
	}

	moveClientBall() {
		if (!this.ball || !this.ball.body) {
			return;
		}

		let data = this.getGameBallData();
		if (data && data.timestamp != this.lastBallTimestampRead) {
			this.ball.body.x = data.x;
			this.ball.body.y = data.y;
			this.ball.body.velocity.x = data.velocityX;
			this.ball.body.velocity.y = data.velocityY;

			//This is used for interpolation in addition with velocities
			this.lastBallTimestampRead = data.timestamp;
		}
	}

	getBallPositionData() {
		return {
			x: this.ball.body.x,
			y: this.ball.body.y,
			velocityX: this.ball.body.velocity.x,
			velocityY: this.ball.body.velocity.y
		};
	}

	getPlayerPositionData(player) {
		return {
			x: player.body.x,
			y: player.body.y,
			velocityX: player.body.velocity.x,
			velocityY: player.body.velocity.y
		};
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
		this.ball.body.data.gravityScale = 0;
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
};
