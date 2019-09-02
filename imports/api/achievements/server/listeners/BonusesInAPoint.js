import GameListener from './GameListener';
import {ACHIEVEMENT_BONUSES_IN_A_POINT} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import PointTaken from '/imports/api/games/events/PointTaken';

export default class BonusesInAPoint extends GameListener {
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
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_BONUSES_IN_A_POINT);
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
