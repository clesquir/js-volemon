import {ACHIEVEMENT_UNDESIRABLE} from '/imports/api/achievements/constants.js';
import {BONUS_NOTHING} from '/imports/api/games/bonusConstants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusCreated from '/imports/api/games/events/BonusCreated.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {getArrayMax, getUTCTimeStamp} from '/imports/lib/utils.js';
import GameListener from './GameListener.js';

export default class Undesirable extends GameListener {
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
			this.addBonus(event.data.bonusIdentifier, event.data.createdAt);
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
			this.removeBonus(event.activationData.bonusIdentifier);
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
			this.removeAllBonuses();
			this.initBonuses();
		}
	}

	/**
	 * @private
	 */
	initBonuses() {
		this.bonuses = {};
	}

	/**
	 * @private
	 */
	addBonus(identifier, createdAt) {
		if (!this.bonuses) {
			this.initBonuses();
		}

		if (this.bonusEnabled(identifier)) {
			this.bonuses[identifier] = createdAt;
		}
	}

	/**
	 * @private
	 */
	removeBonus(identifier) {
		if (this.bonuses && this.bonuses[identifier]) {
			const elapsed = getUTCTimeStamp() - this.bonuses[identifier];
			delete this.bonuses[identifier];

			this.updateNumberIfHigher(ACHIEVEMENT_UNDESIRABLE, elapsed);
		}
	}

	/**
	 * @private
	 */
	removeAllBonuses() {
		if (this.bonuses && Object.keys(this.bonuses).length > 0) {
			const elapsedTimes = [];
			for (let identifier in this.bonuses) {
				if (this.bonuses.hasOwnProperty(identifier)) {
					elapsedTimes.push(getUTCTimeStamp() - this.bonuses[identifier]);
				}
			}

			this.updateNumberIfHigher(ACHIEVEMENT_UNDESIRABLE, getArrayMax(elapsedTimes));
		}
	}

	/**
	 * @private
	 * @param identifier
	 * @returns {boolean}
	 */
	bonusEnabled(identifier) {
		return (identifier.indexOf(BONUS_NOTHING) === -1);
	}
}
