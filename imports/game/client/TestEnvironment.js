import {Random} from 'meteor/random';
import Game from '/imports/game/client/Game.js';
import PhaserEngine from '/imports/game/engine/client/PhaserEngine.js';
import GameData from '/imports/game/client/GameData.js';
import GameStreamBundler from '/imports/game/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/game/client/ServerNormalizedTime.js';
import {Config} from '/imports/lib/config.js';
import {Constants} from '/imports/lib/constants.js';

export default class TestEnvironment {

	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.game = new Game(gameId, new PhaserEngine(), new GameData(gameId), new GameStreamBundler(null), new ServerNormalizedTime());
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

		this.game.engine.loadImage('player1', 'assets/player-' + this.game.gameData.getPlayerShapeFromKey('player1') + '.png');
		this.game.engine.loadImage('ball', 'assets/ball.png');
		this.game.engine.loadImage('ground', 'assets/ground.png');
		this.game.engine.loadImage('delimiter', 'assets/clear.png');
		this.game.engine.loadData(Constants.NORMAL_SCALE_PHYSICS_DATA, 'assets/physicsData.json');
	}

	createGame() {
		this.overrideGame();

		this.game.engine.createGame();

		this.game.createCollisionGroupsAndMaterials();

		const yPosition = this.game.ySize - this.game.groundHeight - (Constants.PLAYER_HEIGHT / 2);
		this.game.player1 = this.game.engine.addSprite(Config.playerInitialLocation, yPosition, 'player1', undefined);
		this.game.createPlayer(this.game.player1, Config.playerInitialLocation, yPosition, 'player1');

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
