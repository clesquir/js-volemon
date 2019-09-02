import GameListener from './GameListener';
import {ACHIEVEMENT_INVISIBLE_IN_A_POINT} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import PointTaken from '/imports/api/games/events/PointTaken';
import {BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants';

export default class InvisibleInAPoint extends GameListener {
	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
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
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_INVISIBLE_IN_A_POINT);
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
