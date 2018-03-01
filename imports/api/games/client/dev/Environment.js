import Game from '/imports/api/games/client/Game.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import StaticLevelGameConfiguration from '/imports/api/games/configuration/StaticLevelGameConfiguration.js';
import StaticGameData from '/imports/api/games/data/StaticGameData.js';
import DesktopController from '/imports/api/games/deviceController/DesktopController.js';
import Phaser3Engine from '/imports/api/games/engine/client/Phaser3Engine.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps.js';
import {Random} from 'meteor/random';

export default class Environment {
	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.gameData = new StaticGameData();
		this.gameData.init();
		this.gameConfiguration = new StaticLevelGameConfiguration(LevelConfiguration.definedSize(900, 400));
		this.gameStreamBundler = new GameStreamBundler(null);
		this.deviceController = new DesktopController(CustomKeymaps.defaultKeymaps());
		this.deviceController.init();
		this.engine = new Phaser3Engine();
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.gameSkin = new GameSkin(new DefaultSkin(), []);
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
				backgroundColor: this.gameSkin.backgroundColor(),
				renderTo: 'environmentGameContainer'
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
		this.game.collisions.init();

		this.playerShape = PLAYER_DEFAULT_SHAPE;

		this.game.player1 = this.engine.addSprite(
			this.gameConfiguration.player1InitialX(),
			this.gameConfiguration.playerInitialY(),
			'shape-' + this.playerShape
		);
		this.engine.initData(this.game.player1);
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
		this.engine.initData(this.game.player2);
		this.game.player2.data.key = 'player2';
		this.game.initPlayer(
			this.game.player2,
			this.gameConfiguration.player2InitialX(),
			this.gameConfiguration.playerInitialY(),
			this.game.collisions.hostPlayerCollisionGroup
		);

		this.game.createBall(100, 100);

		this.createLevelComponents();

		this.game.createCountdownText();
	}

	overrideGame() {
		this.gameData.isUserHost = () => {return true;};
		this.gameData.isGameStatusStarted = () => {return true;};
		this.gameData.getPlayerShapeFromKey = () => {return this.playerShape;};
		this.gameData.getPlayerPolygonFromKey = () => {return this.playerShape;};
		this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();
		this.gameStreamBundler.emitStream = () => {};
		this.game.hitGround = this.hitGround;
		this.game.groundHitEnabled = true;
		this.gameBonus.createBonusIfTimeHasElapsed = () => {};
	}

	randomlyMoveOpponent() {
		const minX = 300;
		const maxX = 750;
		let x = Math.floor(Math.random() * (maxX - minX)) + minX;
		const minY = 300;
		const maxY = 465;
		let y = Math.floor(Math.random() * (maxY - minY)) + minY;

		this.game.moveOppositePlayer({
			x: x,
			y: y,
			velocityX: (this.game.player2.x > x ? -100 : 100),
			velocityY: (this.game.player2.y > y ? -100 : 100),
			timestamp: this.serverNormalizedTime.getServerTimestamp()
		});
	}

	enableOpponentMoveEnabled() {
		const delay = 2500;

		Meteor.clearInterval(this.movingInterval);
		this.movingInterval = Meteor.setInterval(() => {
			this.randomlyMoveOpponent();
		}, delay);
	}

	disableOpponentMoveEnabled() {
		Meteor.clearInterval(this.movingInterval);
	}

	createLevelComponents() {
		this.game.levelComponents.groundGroup = this.game.engine.addGroup(false);
		this.game.levelComponents.createGround();
		const ground = this.game.levelComponents.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, ground);
		this.game.addPlayerCanJumpOnBody(this.game.player2, ground);
	}

	updateGame() {
		this.game.updateGame();
	}

	createRandomBonus() {
		this.gameBonus.createRandomBonus();
	}

	enableGroundHit() {
		this.game.groundHitEnabled = true;
	}

	disableGroundHit() {
		this.game.groundHitEnabled = false;
	}

	enablePlayerCanJumpOnPlayer() {
		this.game.addPlayerCanJumpOnBody(this.game.player1, this.game.player2.body);
	}

	disablePlayerCanJumpOnPlayer() {
		this.game.removePlayerCanJumpOnBody(this.game.player1, this.game.player2.body);
	}

	hitGround() {
		if (this.groundHitEnabled && this.gameResumed === true) {
			this.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			this.onPointTaken();
		}
	}
}
