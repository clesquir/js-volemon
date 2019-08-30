import GameListener from './GameListener';
import {ACHIEVEMENT_BONUSES_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';

export default class BonusesInALifetime extends GameListener {
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
			this.incrementNumber(ACHIEVEMENT_BONUSES_IN_A_LIFETIME);
		}
	}
}
