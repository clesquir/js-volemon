import {Random} from 'meteor/random';
import Game from '/imports/api/games/client/Game.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import GameData from '/imports/api/games/client/data/GameData.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';
import NullDeviceController from '/imports/api/games/client/deviceController/NullDeviceController.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import {NORMAL_SCALE_PHYSICS_DATA, PLAYER_HEIGHT, PLAYER_WIDTH} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';

export default class Shape {

	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		const gameConfiguration = new StaticGameConfiguration(gameId);
		this.game = new Game(
			gameId,
			new PhaserEngine(gameConfiguration, new NullDeviceController()),
			new GameData(gameId),
			gameConfiguration,
			new GameSkin(new DefaultSkin(), []),
			new GameStreamBundler(null),
			new ServerNormalizedTime()
		);
		this.game.xSize = 1450;
		this.game.engine.start(
			this.game.xSize, this.game.ySize, 'shapeGameContainer',
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
		this.game.loadLevelComponents();
	}

	createGame() {
		this.overrideGame();

		this.game.engine.createGame();

		this.game.createCollisionGroupsAndMaterials();

		let xPosition = PLAYER_WIDTH / 2;
		const yPosition = this.game.ySize - this.game.groundHeight - (PLAYER_HEIGHT / 2);

		this.game.gameData.getPlayerShapeFromKey = function(playerKey) {
			const shapeKey = playerKey.substr(6) - 1;
			return PLAYER_LIST_OF_SHAPES[shapeKey];
		};

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;

			this.game['player' + playerIndex] = this.game.engine.addSprite(xPosition, yPosition, 'shape-' + PLAYER_LIST_OF_SHAPES[i]);
			this.game['player' + playerIndex].data.key = 'player' + playerIndex;
			this.game.createPlayer(this.game['player' + playerIndex], xPosition, yPosition, 'player' + playerIndex, this.game.hostPlayerCollisionGroup);

			xPosition += PLAYER_WIDTH + 5;
		}

		this.game.createBall(100, 100);

		this.createLevelComponents();

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
				this.resumeOnTimerEnd();

				this.game.gameResumed = false;
			}
		};
	}

	createLevelComponents() {
		this.game.createGroundLevelComponents();
		const ground = this.game.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, ground);
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
		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;
			this.game.spawnPlayer(this.game['player' + playerIndex]);
		}
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
