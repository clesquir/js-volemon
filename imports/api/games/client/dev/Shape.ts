import Dev from "./Dev";
import {PLAYER_LIST_OF_SHAPES} from "../../shapeConstants";
import LevelConfiguration from "../../levelConfiguration/LevelConfiguration";
import Player from "../component/Player";

export default class Shape extends Dev {
	players: { [key: string]: Player } = {};

	beforeStart() {
		this.gameConfiguration.levelConfiguration = LevelConfiguration.definedSize(1525, 200);
	}

	overrideGame() {
		super.overrideGame();

		this.gameData.getPlayerShapeFromKey = (playerKey) => {
			return PLAYER_LIST_OF_SHAPES[this.shapeKey(playerKey)];
		};
		this.gameConfiguration.playerInitialXFromKey = (playerKey) => {
			return (
				this.gameConfiguration.playerWidth() / 2 +
				(this.gameConfiguration.playerWidth() + 10) * (this.shapeKey(playerKey)) + 10
			);
		};
		let countPlayers = 0;
		this.gameConfiguration.playerInitialY = () => {
			countPlayers++;

			if (countPlayers <= PLAYER_LIST_OF_SHAPES.length) {
				return this.gameConfiguration.levelConfiguration.playerInitialY();
			} else {
				return this.gameConfiguration.levelConfiguration.playerInitialY() - this.gameConfiguration.playerHeight() - 20;
			}
		};
		this.mainScene.players.getPlayerFromKey = (playerKey) => {
			return this.players[playerKey];
		};
	}

	createPlayersComponents() {
		this.gameData.getPlayerShapeFromKey = (playerKey: string) => {
			return PLAYER_LIST_OF_SHAPES[this.shapeKey(playerKey)];
		};

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length * 2; i++) {
			let playerIndex = i + 1;
			let isHost = true;
			let color = '#a73030';

			if (playerIndex > PLAYER_LIST_OF_SHAPES.length) {
				isHost = false;
				color = '#274b7a';
			}

			this.players['player' + playerIndex] = this.mainScene.players.createPlayer('player' + playerIndex, isHost, color);
		}
	}

	resetPlayersAndBall() {
		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length * 2; i++) {
			let playerIndex = i + 1;
			this.players['player' + playerIndex].reset();
		}

		this.mainScene.ball.reset(this.gameData.lastPointTaken);
	}

	createLevelComponents() {
		this.mainScene.level.createGround();
		this.mainScene.level.createFieldLimits(false);
	}

	updateGame() {
		super.updateGame();

		for (let i = 0; i < PLAYER_LIST_OF_SHAPES.length * 2; i++) {
			let playerIndex = i + 1;
			this.players['player' + playerIndex].updateEye(this.mainScene.ball);
			this.players['player' + playerIndex].freeze();
		}

		this.mainScene.ball.freeze();
	}

	private shapeKey(playerKey): number {
		let shapeKey = parseInt(playerKey.substr(6));

		if (shapeKey > PLAYER_LIST_OF_SHAPES.length) {
			shapeKey = shapeKey - PLAYER_LIST_OF_SHAPES.length;
		}

		return shapeKey - 1;
	}
}
