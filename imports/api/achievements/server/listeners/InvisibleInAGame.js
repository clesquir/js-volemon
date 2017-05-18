import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_INVISIBLE_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {Constants} from '/imports/lib/constants.js';

export default class InvisibleInAGame extends Listener {
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
			event.activatedBonusClass === Constants.BONUS_INVISIBLE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.updateNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_INVISIBLE_IN_A_GAME);
		}
	}
}
