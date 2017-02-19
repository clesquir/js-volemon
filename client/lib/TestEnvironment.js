import Game from '/client/lib/game/ClientGame.js';
import { Constants } from '/lib/constants.js';

export default class TestEnvironment {

	constructor() {
		this.game = null;
	}

	start() {
		this.game = new Game();
		this.game.xSize = 500;
		this.game.ySize = 400;
		this.game.groundHeight = 50;
		this.game.engine.start(
			this.game.xSize, this.game.ySize, 'testEnvironmentContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
	}

	stop() {
		if (this.game) {
			this.game.engine.stop();
		}
	}

	preloadGame() {
		this.game.engine.preloadGame();

		this.game.engine.loadImage('player1', 'assets/player-' + this.game.getPlayerShapeFromKey('player1') + '.png');
		this.game.engine.loadImage('ball', 'assets/ball.png');
		this.game.engine.loadImage('ground', 'assets/ground.png');
		this.game.engine.loadImage('delimiter', 'assets/clear.png');
		this.game.engine.loadData(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json');
	}

	createGame() {
		this.overrideGame();

		this.game.engine.createGame();

		this.game.createCollisionGroupsAndMaterials();

		this.game.player1 = this.game.engine.addSprite(300, 300, 'player1');
		this.game.createPlayer(this.game.player1, 300, 300, 'player1');

		this.game.createBall(100, 100);

		this.loadLevel();

		this.game.engine.addKeyControllers();

		this.resumeOnTimerEnd();
	}

	overrideGame() {
		this.game.getCurrentPlayer = () => {
			return this.game.player1;
		};

		this.game.sendPlayerPosition = () => {};

		this.game.hitGround = () => {
			if (this.game.gameResumed == true) {
				this.game.shakeLevel();
				this.resumeOnTimerEnd();

				this.game.gameResumed = false;
			}
		};
	}

	loadLevel() {
		this.game.level = this.game.engine.addGroup();

		this.game.loadGroundLevel();
	}

	updateGame() {
		this.game.inputs();
	}

	resumeOnTimerEnd() {
		this.game.pauseGame();
		this.respawnSprites();
		this.startCountdownTimer();
	}

	respawnSprites() {
		this.game.spawnPlayer(this.game.player1);
		this.game.spawnBall();
	}

	startCountdownTimer() {
		this.countdownTimer = this.game.engine.createTimer(3, this.resumeGame, this);
		this.countdownTimer.start();
	}

	resumeGame() {
		this.game.engine.unfreeze(this.game.ball);
		this.game.gameResumed = true;
	}

}
