import Game from '/imports/api/games/client/Game.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';
import StaticGameData from '/imports/api/games/data/StaticGameData.js';
import DesktopController from '/imports/api/games/deviceController/DesktopController.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import SkinFactory from '/imports/api/skins/skins/SkinFactory.js';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps.js';
import {Random} from 'meteor/random';

export default class Skin {
	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.gameData = new StaticGameData();
		this.gameData.init();
		this.gameConfiguration = new StaticGameConfiguration();
		this.gameConfiguration.levelConfiguration = LevelConfiguration.fromMode(Session.get('dev.skin.currentMode'));
		this.gameStreamBundler = new GameStreamBundler(null);
		this.deviceController = new DesktopController(CustomKeymaps.defaultKeymaps());
		this.deviceController.init();
		this.engine = new PhaserEngine();
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.gameSkin = new GameSkin(SkinFactory.fromId(Session.get('dev.skin.currentSkin')), []);
		this.game = new Game(
			gameId,
			this.deviceController,
			this.engine,
			this.gameData,
			this.gameConfiguration,
			this.gameSkin,
			this.gameStreamBundler,
			this.serverNormalizedTime
		);
		this.gameBonus = this.game.gameBonus;
		this.game.engine.start(
			{
				width: this.gameConfiguration.width(),
				height: this.gameConfiguration.height(),
				gravity: this.gameConfiguration.worldGravity(),
				bonusRadius: this.gameConfiguration.bonusRadius(),
				renderTo: 'skinGameContainer'
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

		this.createComponents();
		this.gameBonus.createComponents();

		this.deviceController.startMonitoring();
		this.engine.createGame();

		this.game.gameInitiated = true;

		this.game.resumeOnTimerEnd();

		this.onGameCreated();
	}

	onGameCreated() {
	}

	createComponents() {
		this.gameSkin.createBackgroundComponents(
			this.engine,
			this.gameConfiguration.width(),
			this.gameConfiguration.height()
		);
		this.game.collisions.init();

		this.playerShape = PLAYER_DEFAULT_SHAPE;

		this.game.player1 = this.engine.addSprite(
			this.gameConfiguration.player1InitialX(),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShape
		);
		this.engine.setTint(this.game.player1, '#a73030');
		this.game.player1.data.key = 'player1';
		this.game.initPlayer(
			this.game.player1,
			this.gameConfiguration.player1InitialX(),
			this.gameConfiguration.playerInitialY(),
			this.game.collisions.hostPlayerCollisionGroup
		);

		this.game.player2 = this.engine.addSprite(
			this.gameConfiguration.player2InitialX(),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShape
		);
		this.engine.setTint(this.game.player2, '#274b7a');
		this.game.player2.data.key = 'player2';
		this.game.initPlayer(
			this.game.player2,
			this.gameConfiguration.player2InitialX(),
			this.gameConfiguration.playerInitialY(),
			this.game.collisions.clientPlayerCollisionGroup
		);

		this.game.createBall(100, 100);

		this.createLevelComponents();

		this.game.createCountdownText();
	}

	overrideGame() {
		this.gameData.isUserCreator = () => {return true;};
		this.gameData.isUserHost = () => {return true;};
		this.gameData.isGameStatusStarted = () => {return true;};
		this.gameData.getPlayerShapeFromKey = () => {return this.playerShape;};
		this.gameData.getPlayerPolygonFromKey = () => {return this.playerShape;};
		this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
		this.gameStreamBundler.emitStream = () => {};
		this.game.hitGround = () => {
			if (this.game.gameResumed === true) {
				this.resumeOnTimerEnd();

				this.game.gameResumed = false;
			}
		};
		this.game.groundHitEnabled = true;
		this.gameBonus.createBonusIfTimeHasElapsed = () => {};
	}

	resumeOnTimerEnd() {
		this.game.pauseGame();
		this.respawnSprites();
		this.startCountdownTimer();
	}

	respawnSprites() {
		this.game.spawnPlayer(this.game.player1);
		this.game.spawnPlayer(this.game.player2);
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

	createLevelComponents() {
		this.game.levelComponents.groundGroup = this.game.engine.addGroup(false);
		this.game.levelComponents.createGround();
		this.game.levelComponents.createNet();
		this.game.levelComponents.createBounds();
		this.game.addPlayerCanJumpOnBody(this.game.player1, this.game.levelComponents.groundBound);
		this.game.addPlayerCanJumpOnBody(this.game.player2, this.game.levelComponents.groundBound);
	}

	updateGame() {
		this.game.updateGame();
	}

	cheerPlayer(forHost) {
		this.game.cheer(forHost);
	}
}
