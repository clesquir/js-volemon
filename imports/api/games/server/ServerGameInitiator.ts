import GameStreamInitiator from "./GameStreamInitiator";
import GameListeners from "../../achievements/server/GameListeners";
import {ServerStreamInitiator} from "../../../lib/stream/server/ServerStreamInitiator";

export default class ServerGameInitiator {
	gameId: string;
	gameStreamInitiator: GameStreamInitiator;
	achievementListeners: GameListeners;

	constructor(gameId: string) {
		this.gameId = gameId;

		this.gameStreamInitiator = new GameStreamInitiator(gameId, ServerStreamInitiator);
		this.achievementListeners = new GameListeners(gameId);
	}

	init() {
		this.gameStreamInitiator.init();
		this.achievementListeners.init();
	}

	start() {
		this.gameStreamInitiator.start();
		this.achievementListeners.start();
	}

	stop() {
		this.gameStreamInitiator.stop();
		this.achievementListeners.stop();
	}
}
