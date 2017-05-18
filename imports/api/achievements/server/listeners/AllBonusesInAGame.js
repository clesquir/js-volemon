import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_ALL_BONUSES_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import BonusFactory from '/imports/game/BonusFactory.js';

export default class AllBonusesInAGame extends Listener {
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
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.addBonusCaught(event.bonusClass);

			if (this.hasCaughtAllBonuses()) {
				this.incrementNumber(ACHIEVEMENT_ALL_BONUSES_IN_A_GAME);
				this.initBonusesCaught();
			}
		}
	}

	availableBonuses() {
		return BonusFactory.availableBonuses();
	}

	initBonusesCaught() {
		const bonuses = this.availableBonuses();

		this.bonusesCaught = {};
		for (let bonus of bonuses) {
			this.bonusesCaught[bonus] = false;
		}
	}

	/**
	 * @param bonusClass
	 */
	addBonusCaught(bonusClass) {
		if (!this.bonusesCaught) {
			this.initBonusesCaught();
		}

		this.bonusesCaught[bonusClass] = true;
	}

	/**
	 * @returns {boolean}
	 */
	hasCaughtAllBonuses() {
		for (let bonusClass in this.bonusesCaught) {
			if (this.bonusesCaught.hasOwnProperty(bonusClass) && !this.bonusesCaught[bonusClass]) {
				return false;
			}
		}

		return true;
	}
}
