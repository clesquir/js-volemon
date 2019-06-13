import {ACHIEVEMENT_INTOXICATED} from '/imports/api/achievements/constants.js';
import {BONUS_POISON} from '/imports/api/games/bonusConstants';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import GameListener from './GameListener';

export default class Intoxicated extends GameListener {
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
			event.activatedBonusClass === BONUS_POISON &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.incrementNumber(ACHIEVEMENT_INTOXICATED);
		}
	}
}
