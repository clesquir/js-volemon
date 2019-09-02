import GameListener from './GameListener';
import {ACHIEVEMENT_SIMULTANEOUS_ACTIVATED_BONUSES} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import BonusRemoved from '/imports/api/games/events/BonusRemoved';
import PointTaken from '/imports/api/games/events/PointTaken';

export default class SimultaneousActivatedBonuses extends GameListener {
	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(BonusRemoved.getClassName(), this.onBonusRemoved);
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.removeListener(BonusRemoved.getClassName(), this.onBonusRemoved);
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
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
