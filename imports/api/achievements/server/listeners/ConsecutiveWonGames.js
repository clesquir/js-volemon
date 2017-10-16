import GameListener from './GameListener.js';
import {ACHIEVEMENT_CONSECUTIVE_WON_GAMES} from '/imports/api/achievements/constants.js';
import PlayerLost from '/imports/api/games/events/PlayerLost.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';

export default class ConsecutiveWonGames extends GameListener {
	allowedForTournamentGame() {
		return true;
	}

	addListeners() {
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
		this.addListener(PlayerLost.prototype.constructor.name, this.onPlayerLost);
	}

	removeListeners() {
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
		this.removeListener(PlayerLost.prototype.constructor.name, this.onPlayerLost);
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			this.initNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
			this.updatetNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
		}
	}

	/**
	 * @param {PlayerLost} event
	 */
	onPlayerLost(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId
		) {
			this.resetNumberSinceLastReset();
		}
	}

	resetNumberSinceLastReset() {
		const userAchievement = this.userAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
		this.numberSinceLastReset = 0;

		if (!userAchievement) {
			this.insertAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES, {number: 0, numberSinceLastReset: 0});
		} else {
			this.updateAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES, {numberSinceLastReset: 0});
		}
	}
}
