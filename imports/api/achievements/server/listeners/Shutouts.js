import GameListener from './GameListener.js';
import {ACHIEVEMENT_SHUTOUTS} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';

export default class Shutouts extends GameListener {
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
			event.userId === this.userId &&
			event.winnerPoints === GAME_MAXIMUM_POINTS &&
			event.loserPoints === 0
		) {
			this.incrementNumber(ACHIEVEMENT_SHUTOUTS);
		}
	}
}
