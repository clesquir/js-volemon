import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_CONSECUTIVE_WON_GAMES} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';

export default class ConsecutiveWonGames extends Listener {
	addListeners() {
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			this.incrementNumber(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
		}
	}
}
