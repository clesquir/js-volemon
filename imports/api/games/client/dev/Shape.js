import Dev from '/imports/api/games/client/dev/Dev.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants';
import {Random} from 'meteor/random';

export default class Shape extends Dev {
	beforeStart() {
		this.gameConfiguration.levelConfiguration = LevelConfiguration.definedSize(1450, 560);
	}

	createPlayersComponents() {
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
	}

	overrideGame() {
		super.overrideGame();
		this.game.gameData.getPlayerShapeFromKey = (playerKey) => {return this.game[playerKey].data.shape;};
		this.game.gameData.getPlayerPolygonFromKey = (playerKey) => {return this.game[playerKey].data.shape;};
	}

	respawnSprites() {
		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;
			this.game.spawnPlayer(this.game['player' + playerIndex]);
		}
		this.game.spawnBall();
	}

	createLevelComponents() {
		this.game.levelComponents.groundGroup = this.game.engine.addGroup(false);
		this.game.levelComponents.createGround();
		const ground = this.game.levelComponents.createGroundBound();
		this.game.addPlayerCanJumpOnBody(this.game.player1, ground);
	}

	updateGame() {
		this.game.updateGame();

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length; i++) {
			let playerIndex = i + 1;
			this.engine.updatePlayerEye(this.game['player' + playerIndex], this.game.ball);
		}
	}
}
