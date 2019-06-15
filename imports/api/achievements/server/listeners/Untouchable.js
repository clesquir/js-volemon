import {ACHIEVEMENT_UNTOUCHABLE} from '/imports/api/achievements/constants';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import PlayerLost from '/imports/api/games/events/PlayerLost';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import GameListener from './GameListener';

export default class Untouchable extends GameListener {
	allowedForGameMode(gameMode) {
		return !isTwoVersusTwoGameMode(gameMode);
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
			event.userId === this.userId &&
			event.winnerPoints === this.gameMaximumPoints()
		) {
			//Do not reset if opponent has forfeited
			if (event.loserPoints === 0) {
				this.initNumberSinceLastReset(ACHIEVEMENT_UNTOUCHABLE);
				this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_UNTOUCHABLE);
				this.updateNumberSinceLastReset(ACHIEVEMENT_UNTOUCHABLE);
			} else {
				this.resetNumberSinceLastReset();
			}
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
		const userAchievement = this.getUserAchievement(ACHIEVEMENT_UNTOUCHABLE);
		this.numberSinceLastReset = 0;

		if (!userAchievement) {
			this.insertAchievement(ACHIEVEMENT_UNTOUCHABLE, {number: 0, numberSinceLastReset: 0});
		} else {
			this.updateAchievement(ACHIEVEMENT_UNTOUCHABLE, {numberSinceLastReset: 0});
		}
	}
}
