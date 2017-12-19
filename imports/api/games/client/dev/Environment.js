import {Random} from 'meteor/random';
import GameData from '/imports/api/games/client/data/GameData.js';
import DesktopController from '/imports/api/games/client/deviceController/DesktopController.js';
import Game from '/imports/api/games/client/Game.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import GameSkin from '/imports/api/games/client/skin/GameSkin.js';
import StaticGameConfiguration from '/imports/api/games/configuration/StaticGameConfiguration.js';
import {PLAYER_HEIGHT, PLAYER_INITIAL_LOCATION} from '/imports/api/games/constants.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import DefaultSkin from '/imports/api/skins/skins/DefaultSkin.js';
import CustomKeymaps from '/imports/lib/keymaps/CustomKeymaps.js';

export default class Environment {
	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.gameData = new GameData(gameId);
		this.gameConfiguration = new StaticGameConfiguration(gameId);
		this.gameStreamBundler = new GameStreamBundler(null);
		const desktopController = new DesktopController(CustomKeymaps.defaultKeymaps());
		desktopController.init();
		this.gameEngine = new PhaserEngine(this.gameConfiguration, desktopController);
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.game = new Game(
			gameId,
			this.gameEngine,
			this.gameData,
			this.gameConfiguration,
			new GameSkin(new DefaultSkin(), []),
			this.gameStreamBundler,
			this.serverNormalizedTime
		);
		this.gameBonus = this.game.gameBonus;
		this.game.engine.start(
			this.game.xSize, this.game.ySize, 'environmentGameContainer',
			this.preloadGame, this.createGame, this.updateGame,
			this
		);
	}

	stop() {
		if (this.game) {
			this.gameEngine.stop();
		}
	}

	preloadGame() {
		this.game.preloadGame();
	}

	createGame() {
		this.overrideGame();

		this.createComponents();
		this.gameBonus.createComponents();

		this.gameEngine.createGame();

		this.game.gameInitiated = true;

		this.game.resumeOnTimerEnd();

		this.onGameCreated();
	}

	onGameCreated() {
	}

	createComponents() {
		this.game.createCollisionGroupsAndMaterials();

		const playerShape = 'half-circle';
		let xPosition = PLAYER_INITIAL_LOCATION;
		const yPosition = this.game.ySize - this.game.groundHeight - (PLAYER_HEIGHT / 2);

		this.game.player1 = this.gameEngine.addSprite(xPosition, yPosition, 'shape-' + playerShape);
		this.game.player1.data.key = 'player1';
		this.game.createPlayer(this.game.player1, xPosition, yPosition, 'shape-' + playerShape, this.game.hostPlayerCollisionGroup);

		xPosition = this.game.xSize - PLAYER_INITIAL_LOCATION;
		this.game.player2 = this.gameEngine.addSprite(xPosition, yPosition, 'shape-' + playerShape);
		this.game.player2.data.key = 'player2';
		this.game.createPlayer(this.game.player2, xPosition, yPosition, 'shape-' + playerShape, this.game.hostPlayerCollisionGroup);

		this.game.createBall(100, 100);

		this.createLevelComponents();

		this.game.createCountdownText();
	}

	overrideGame() {
		this.gameData.isUserHost = () => {return true;};
		this.gameData.isGameStatusStarted = () => {return true;};
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
		this.game.groundGroup = this.game.engine.addGroup(false);
		this.game.createGroundLevelComponents();
		const ground = this.game.createGroundBound();
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

	hitGround(ball) {
		if (this.groundHitEnabled && this.gameResumed === true) {
			this.gameResumed = false;

			this.gameData.lastPointAt = this.serverNormalizedTime.getServerTimestamp();

			this.onPointTaken();
		}
	}
}
