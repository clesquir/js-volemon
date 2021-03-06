import GameListener from './GameListener';
import {ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants';

export default class InvisibleInALifetime extends GameListener {
	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
	}

	removeListeners() {
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			event.activatedBonusClass === BONUS_INVISIBLE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.incrementNumber(ACHIEVEMENT_INVISIBLE_IN_A_LIFETIME);
		}
	}
}
