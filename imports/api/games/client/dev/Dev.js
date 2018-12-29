import Game from '/imports/api/games/client/Game';
import NullStreamBundler from '/imports/api/games/client/streamBundler/NullStreamBundler';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime';
import GameSkin from '/imports/api/games/client/skin/GameSkin';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration';
import StaticGameData from '/imports/api/games/data/StaticGameData';
import DesktopController from '/imports/api/games/deviceController/DesktopController';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps';
import {Random} from 'meteor/random';

export default class Dev {
	constructor() {
		this.game = null;
		this.renderer = null;

		this.gameId = Random.id(5);
		this.gameData = new StaticGameData();
		this.gameData.init();
		this.gameConfiguration = new StaticGameConfiguration();
		this.streamBundler = new NullStreamBundler();
		this.deviceController = new DesktopController(CustomKeymaps.defaultKeymaps());
		this.deviceController.init();
		this.engine = new PhaserEngine();
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.gameSkin = new GameSkin(new DefaultSkin(), []);
	}

	beforeStart() {
	}

	start() {
		this.beforeStart();

		this.game = new Game(
			this.gameId,
			this.deviceController,
			this.engine,
			this.gameData,
			this.gameConfiguration,
			this.gameSkin,
			this.streamBundler,
			this.serverNormalizedTime
		);
		this.gameBonus = this.game.gameBonus;
		this.game.engine.start(
			{
				width: this.gameConfiguration.width(),
				height: this.gameConfiguration.height(),
				gravity: this.gameConfiguration.worldGravity(),
				smallPlayerScale: this.gameConfiguration.smallPlayerScale(),
				bigPlayerScale: this.gameConfiguration.bigPlayerScale(),
				smallBallScale: this.gameConfiguration.smallBallScale(),
				bigBallScale: this.gameConfiguration.bigBallScale(),
				bonusRadius: this.gameConfiguration.bonusRadius(),
				renderTo: 'devGameContainer'
			},
			this.preloadGame, this.createGame, this.updateGame, this,
			{
				debug: true,
				renderer: this.renderer
			}
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

		this.game.createArtificialIntelligence();
		this.createPlayersComponents();

		this.game.createBall(100, 100);

		this.createLevelComponents();

		this.game.createCountdownText();
	}

	createPlayersComponents() {
		this.game.player1 = this.game.createHostPlayer('player1', '#a73030');
		this.game.player2 = this.game.createClientPlayer('player2', '#274b7a');
	}

	overrideGame() {
		this.gameData.isUserCreator = () => {return true;};
		this.gameData.isUserHost = () => {return true;};
		this.gameData.isGameStatusStarted = () => {return true;};
		this.gameData.getPlayerShapeFromKey = () => {return PLAYER_DEFAULT_SHAPE;};
		this.gameData.getPlayerPolygonFromKey = () => {return PLAYER_DEFAULT_SHAPE;};
		this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
		this.streamBundler.emitStream = () => {};
		this.game.hitGround = (ball) => {
			this.hitGround(ball);
		};
		this.gameBonus.createBonusIfTimeHasElapsed = () => {};
	}

	hitGround(ball) {
		if (this.game.gameResumed === true) {
			this.game.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
			this.resumeOnTimerEnd();
		}
	}

	resumeOnTimerEnd() {
		this.game.pauseGame();
		this.respawnSprites();
		this.game.startCountdownTimer();
	}

	respawnSprites() {
		this.game.resetPlayer(this.game.player1);
		this.game.resetPlayer(this.game.player2);
		this.game.spawnBall();
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
