import {Random} from 'meteor/random';
import Game from '/imports/api/games/client/Game.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import GameData from '/imports/api/games/client/GameData.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import {
	NORMAL_SCALE_PHYSICS_DATA,
	PLAYER_HEIGHT,
	PLAYER_INITIAL_LOCATION
} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants';

export default class Environment {

	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.game = new Game(gameId, new PhaserEngine(), new GameData(gameId), new GameStreamBundler(null), new ServerNormalizedTime());
		this.game.engine.start(
			this.game.xSize, this.game.ySize, 'environmentGameContainer',
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

		for (let shape of PLAYER_LIST_OF_SHAPES) {
			this.game.engine.loadImage('shape-' + shape, '/assets/player-' + shape + '.png');
		}

		this.game.engine.loadImage('ball', '/assets/ball.png');
		this.game.engine.loadImage('ground', '/assets/ground.png');
		this.game.engine.loadImage('delimiter', '/assets/clear.png');
		this.game.engine.loadData(NORMAL_SCALE_PHYSICS_DATA, '/assets/physicsData.json');
	}

	createGame() {
		this.overrideGame();

		this.game.engine.createGame();

		this.game.createCollisionGroupsAndMaterials();

		const playerShape = 'half-circle';
		const yPosition = this.game.ySize - this.game.groundHeight - (PLAYER_HEIGHT / 2);

		this.game.player1 = this.game.engine.addSprite(PLAYER_INITIAL_LOCATION, yPosition, 'shape-' + playerShape, undefined);
		this.game.player1.data.key = 'player1';
		this.game.createPlayer(this.game.player1, PLAYER_INITIAL_LOCATION, yPosition, 'shape-' + playerShape);

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
			if (this.game.gameResumed === true) {
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
