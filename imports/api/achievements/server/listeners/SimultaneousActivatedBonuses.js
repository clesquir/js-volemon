import GameListener from './GameListener';
import {ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusRemoved from '/imports/api/games/events/BonusRemoved.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';

export default class SimultaneousActivatedBonuses extends GameListener {
	addListeners() {
		this.addListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.addListener(BonusRemoved.prototype.constructor.name, this.onBonusRemoved);
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCaught.prototype.constructor.name, this.onBonusCaught);
		this.removeListener(BonusRemoved.prototype.constructor.name, this.onBonusRemoved);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.addActivatedBonus(event.activatedBonusClass);

			this.updateNumberIfHigher(ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES, this.numberOfActivatedBonuses());
		}
	}

	/**
	 * @param {BonusRemoved} event
	 */
	onBonusRemoved(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.removeActivatedBonus(event.activatedBonusClass);
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
			this.resetActivatedBonuses();
		}
	}

	addActivatedBonus(bonus) {
		if (!this.activatedBonuses) {
			this.resetActivatedBonuses();
		}

		this.activatedBonuses[bonus] = true;
	}

	removeActivatedBonus(bonus) {
		if (!this.activatedBonuses) {
			this.resetActivatedBonuses();
		}

		delete this.activatedBonuses[bonus];
	}

	/**
	 * @returns {number}
	 */
	numberOfActivatedBonuses() {
		let numberOfActivatedBonuses = 0;

		for (let bonus in this.activatedBonuses) {
			if (this.activatedBonuses.hasOwnProperty(bonus) && this.activatedBonuses[bonus]) {
				numberOfActivatedBonuses++;
			}
		}

		return numberOfActivatedBonuses;
	}

	resetActivatedBonuses() {
		this.activatedBonuses = {};
	}
}
