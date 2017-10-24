import {Random} from 'meteor/random';
import Game from '/imports/api/games/client/Game.js';
import PhaserEngine from '/imports/api/games/engine/client/PhaserEngine.js';
import GameData from '/imports/api/games/client/GameData.js';
import GameStreamBundler from '/imports/api/games/client/GameStreamBundler.js';
import ServerNormalizedTime from '/imports/api/games/client/ServerNormalizedTime.js';
import StaticGameConfiguration from '/imports/api/games/client/StaticGameConfiguration.js';
import {PLAYER_HEIGHT, PLAYER_INITIAL_LOCATION} from '/imports/api/games/constants.js';

export default class Environment {

	constructor() {
		this.game = null;
	}

	start() {
		const gameId = Random.id(5);
		this.gameData = new GameData(gameId);
		this.gameConfiguration = new StaticGameConfiguration(gameId);
		this.gameStreamBundler = new GameStreamBundler(null);
		this.gameEngine = new PhaserEngine();
		this.serverNormalizedTime = new ServerNormalizedTime();
		this.game = new Game(
			gameId,
			this.gameEngine,
			this.gameData,
			this.gameConfiguration,
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

		this.gameEngine.addKeyControllers();

		this.game.gameInitiated = true;

		this.game.resumeOnTimerEnd();
	}

	createComponents() {
		this.gameEngine.createGame();
		this.game.createCollisionGroupsAndMaterials();

		const playerShape = 'half-circle';
		let xPosition = PLAYER_INITIAL_LOCATION;
		const yPosition = this.game.ySize - this.game.groundHeight - (PLAYER_HEIGHT / 2);

		this.game.player1 = this.gameEngine.addSprite(xPosition, yPosition, 'shape-' + playerShape);
		this.game.player1.data.key = 'player1';
		this.game.createPlayer(this.game.player1, xPosition, yPosition, 'shape-' + playerShape);

		xPosition = this.game.xSize - PLAYER_INITIAL_LOCATION;
		this.game.player2 = this.gameEngine.addSprite(xPosition, yPosition, 'shape-' + playerShape);
		this.game.player2.data.key = 'player2';
		this.game.createPlayer(this.game.player2, xPosition, yPosition, 'shape-' + playerShape);

		this.game.createBall(100, 100);

		this.loadLevel();

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
			timestamp: require('moment')().utc().valueOf() - 20
		});
	}

	enableOpponentMoveEnabled() {
		const delay = 500;

		Meteor.clearInterval(this.movingInterval);
		this.movingInterval = Meteor.setInterval(() => {
			this.randomlyMoveOpponent();
		}, delay);
	}

	disableOpponentMoveEnabled() {
		Meteor.clearInterval(this.movingInterval);
	}

	loadLevel() {
		this.game.level = this.gameEngine.addGroup();

		this.game.loadGroundLevel();
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
