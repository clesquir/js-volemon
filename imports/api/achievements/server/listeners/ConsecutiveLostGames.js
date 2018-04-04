import GameListener from './GameListener.js';
import {ACHIEVEMENT_CONSECUTIVE_LOST_GAMES} from '/imports/api/achievements/constants.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';

export default class ConsecutiveLostGames extends GameListener {
	addListeners() {
		this.addListener(PlayerLost.prototype.constructor.name, this.onPlayerLost);
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerLost.prototype.constructor.name, this.onPlayerLost);
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	/**
	 * @param {PlayerLost} event
	 */
	onPlayerLost(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			this.initNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES);
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES);
			this.updatetNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES);
		}
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			this.resetNumberSinceLastReset();
		}
	}

	resetNumberSinceLastReset() {
		const userAchievement = this.getUserAchievement(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES);
		this.numberSinceLastReset = 0;

		if (!userAchievement) {
			this.insertAchievement(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES, {number: 0, numberSinceLastReset: 0});
		} else {
			this.updateAchievement(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES, {numberSinceLastReset: 0});
		}
	}
}
