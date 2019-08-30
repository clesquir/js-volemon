import GameStreamInitiator from "./GameStreamInitiator";
import GameListeners from "../../achievements/server/GameListeners";
import {ServerStreamInitiator} from "../../../lib/stream/server/ServerStreamInitiator";
import ReplayPersister from "../replay/ReplayPersister";

export default class ServerGameInitiator {
	gameId: string;
	gameStreamInitiator: GameStreamInitiator;
	achievementListeners: GameListeners;
	replayPersister: ReplayPersister;

	constructor(gameId: string) {
		this.gameId = gameId;

		this.gameStreamInitiator = new GameStreamInitiator(gameId, ServerStreamInitiator);
		this.achievementListeners = new GameListeners(gameId);
		this.replayPersister = new ReplayPersister(gameId, ServerStreamInitiator);
	}

	init() {
		this.gameStreamInitiator.init();
		this.achievementListeners.init();
		this.replayPersister.init();
	}

	start() {
		this.gameStreamInitiator.start();
		this.achievementListeners.start();
		this.replayPersister.start();
	}

	stop() {
		this.replayPersister.stop();
	}

	destroy() {
		this.gameStreamInitiator.destroy();
		this.achievementListeners.destroy();
		this.replayPersister.destroy();
	}
}
