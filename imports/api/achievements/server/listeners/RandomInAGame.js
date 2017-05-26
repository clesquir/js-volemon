import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_RANDOM_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_RANDOM_BONUS} from '/imports/api/games/bonusConstants.js';

export default class RandomInAGame extends Listener {
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
			event.initialBonusClass === BONUS_RANDOM_BONUS &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_RANDOM_IN_A_GAME);
		}
	}
}
