import Game from '/imports/api/games/client/Game.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import StaticLevelGameConfiguration from '/imports/api/games/configuration/StaticLevelGameConfiguration.js';
import StaticGameData from '/imports/api/games/data/StaticGameData.js';
import DesktopController from '/imports/api/games/deviceController/DesktopController.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps.js';
import {Random} from 'meteor/random';

export default class Shape {
	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.gameConfiguration = new StaticLevelGameConfiguration(LevelConfiguration.definedSize(1450, 560));
		this.deviceController = new DesktopController(CustomKeymaps.defaultKeymaps());
		this.deviceController.init();
		this.engine = new PhaserEngine();
		const gameData = new StaticGameData();
		gameData.init();
		this.game = new Game(
			gameId,
			this.deviceController,
			this.engine,
			gameData,
			this.gameConfiguration,
			new GameSkin(new DefaultSkin(), []),
			new GameStreamBundler(null),
			new ServerNormalizedTime()
		);
		this.engine.start(
			{
				width: this.gameConfiguration.width(),
				height: this.gameConfiguration.height(),
				gravity: this.gameConfiguration.worldGravity(),
				bonusRadius: this.gameConfiguration.bonusRadius(),
				renderTo: 'shapeGameContainer'
			},
			this.preloadGame, this.createGame, this.updateGame, this
		);
	}

	stop() {
		if (this.game) {
			this.deviceController.stopMonitoring();
			this.engine.stop();
		}
	}

	preloadGame() {
		this.game.preloadGame();
	}

	createGame() {
		this.overrideGame();

		this.deviceController.startMonitoring();
		this.engine.createGame();

		this.game.collisions.init();

		let xPosition = this.gameConfiguration.playerWidth() / 2;

		this.game.gameData.getPlayerShapeFromKey = function(playerKey) {
			const shapeKey = playerKey.substr(6) - 1;
			return PLAYER_LIST_OF_SHAPES[shapeKey];
		};

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;

			this.game['player' + playerIndex] = this.engine.addSprite(
				xPosition,
				this.gameConfiguration.playerInitialY(),
				'shape-' + PLAYER_LIST_OF_SHAPES[i]
			);
			this.game['player' + playerIndex].data.key = 'player' + playerIndex;
			this.game['player' + playerIndex].data.shape = PLAYER_LIST_OF_SHAPES[i];
			this.game.initPlayer(
				this.game['player' + playerIndex],
				xPosition,
				this.gameConfiguration.playerInitialY(),
				this.game.collisions.hostPlayerCollisionGroup
			);

			xPosition += this.gameConfiguration.playerWidth() + 5;
		}

		this.game.createBall(100, 100);

		this.createLevelComponents();

		this.resumeOnTimerEnd();
	}

	overrideGame() {
		this.game.getCurrentPlayer = () => {
			return this.game.player1;
		};
		this.game.gameData.getPlayerShapeFromKey = (playerKey) => {return this.game[playerKey].data.shape;};
		this.game.gameData.getPlayerPolygonFromKey = (playerKey) => {return this.game[playerKey].data.shape;};

		this.game.sendPlayerPosition = () => {};

		this.game.hitGround = () => {
			if (this.game.gameResumed === true) {
				this.resumeOnTimerEnd();

				this.game.gameResumed = false;
			}
		};
	}

	createLevelComponents() {
		this.game.groundGroup = this.engine.addGroup(false);
		this.game.levelComponents.createGround();
		const ground = this.game.levelComponents.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, ground);
	}

	updateGame() {
		this.game.inputs();

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;
			this.engine.updatePlayerEye(this.game['player' + playerIndex], this.game.ball);
		}
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
		this.countdownTimer = this.engine.createTimer(3, this.resumeGame, this);
		this.countdownTimer.start();
	}

	resumeGame() {
		this.engine.unfreeze(this.game.ball);
		this.game.gameResumed = true;
	}
}
