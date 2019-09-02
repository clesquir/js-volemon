import GameListener from './GameListener';
import {ACHIEVEMENT_CONSECUTIVE_LOST_GAMES} from '/imports/api/achievements/constants.js';
import PlayerLost from '/imports/api/games/events/PlayerLost';
import PlayerWon from '/imports/api/games/events/PlayerWon';

export default class ConsecutiveLostGames extends GameListener {
	addListeners() {
		this.addListener(PlayerLost.getClassName(), this.onPlayerLost);
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerLost.getClassName(), this.onPlayerLost);
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
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
			this.updateNumberSinceLastReset(ACHIEVEMENT_CONSECUTIVE_LOST_GAMES);
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
