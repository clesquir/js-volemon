import {ACHIEVEMENT_THEY_ARE_ALL_OVER} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusCreated from '/imports/api/games/events/BonusCreated.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import GameListener from './GameListener.js';

export default class TheyAreAllOver extends GameListener {
	addListeners() {
		this.addListener(BonusCreated.prototype.constructor.name, this.onBonusCreated);
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCreated.prototype.constructor.name, this.onBonusCreated);
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	/**
	 * @param {BonusCreated} event
	 */
	onBonusCreated(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.addBonus();
		}
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.removeBonus();
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
			this.initBonuses();
		}
	}

	/**
	 * @private
	 */
	initBonuses() {
		this.numberBonusesOnScreen = 0;
	}

	/**
	 * @private
	 */
	addBonus() {
		if (this.numberBonusesOnScreen === undefined) {
			this.initBonuses();
		}

		this.numberBonusesOnScreen++;
		this.updateNumberIfHigher(ACHIEVEMENT_THEY_ARE_ALL_OVER, this.numberBonusesOnScreen);
	}

	/**
	 * @private
	 */
	removeBonus() {
		if (this.numberBonusesOnScreen > 0) {
			this.numberBonusesOnScreen--;
		}
	}
}
