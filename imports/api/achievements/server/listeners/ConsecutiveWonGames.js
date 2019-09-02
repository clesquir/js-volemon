import GameListener from './GameListener';
import {ACHIEVEMENT_CONSECUTIVE_WON_GAMES} from '/imports/api/achievements/constants.js';
import PlayerLost from '/imports/api/games/events/PlayerLost';
import PlayerWon from '/imports/api/games/events/PlayerWon';

export default class ConsecutiveWonGames extends GameListener {
	addListeners() {
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
		this.addListener(PlayerLost.getClassName(), this.onPlayerLost);
	}

	removeListeners() {
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
		this.removeListener(PlayerLost.getClassName(), this.onPlayerLost);
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
			this.updateNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
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
		const userAchievement = this.getUserAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES);
		this.numberSinceLastReset = 0;

		if (!userAchievement) {
			this.insertAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES, {number: 0, numberSinceLastReset: 0});
		} else {
			this.updateAchievement(ACHIEVEMENT_CONSECUTIVE_WON_GAMES, {numberSinceLastReset: 0});
		}
	}
}
