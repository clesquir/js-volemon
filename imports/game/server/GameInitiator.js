import AchievementsListeners from '/imports/api/achievements/server/Listeners.js';
import GameStreamInitiator from '/imports/game/server/GameStreamInitiator.js';
import {ServerStreamInitiator} from '/imports/lib/stream/server/ServerStreamInitiator.js';

export default class GameInitiator {
	/**
	 * @param {string} gameId
	 */
	constructor(gameId) {
		this.gameId = gameId;

		this.gameStreamInitiator = new GameStreamInitiator(gameId, ServerStreamInitiator);
		this.achievementListeners = new AchievementsListeners(gameId);
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
