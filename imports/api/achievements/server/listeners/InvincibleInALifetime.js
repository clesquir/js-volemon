import GameListener from './GameListener';
import {ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {BONUS_INVINCIBLE_MONSTER} from '/imports/api/games/bonusConstants';

export default class InvincibleInALifetime extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesAvailableBonuses();
	}

	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
	}

	removeListeners() {
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			event.activatedBonusClass === BONUS_INVINCIBLE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.incrementNumber(ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME);
		}
	}
}
