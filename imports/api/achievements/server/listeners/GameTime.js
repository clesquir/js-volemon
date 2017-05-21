import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_GAME_TIME} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';

export default class GameTime extends Listener {
	addListeners() {
		this.addListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	/**
	 * @param {GameFinished} event
	 */
	onGameFinished(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.updateNumberIfHigher(ACHIEVEMENT_GAME_TIME, event.gameDuration);
		}
	}
}