import GameListener from './GameListener';
import {ACHIEVEMENT_BONUSES_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';

export default class BonusesInAGame extends GameListener {
	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
	}

	removeListeners() {
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_BONUSES_IN_A_GAME);
		}
	}
}
