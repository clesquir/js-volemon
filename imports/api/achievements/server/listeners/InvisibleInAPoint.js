import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_INVISIBLE_IN_A_POINT} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {Constants} from '/imports/lib/constants.js';

export default class InvisibleInAPoint extends Listener {
	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
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
			this.updateNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_INVISIBLE_IN_A_POINT);
		}
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.resetNumberSinceLastReset();
		}
	}
}
