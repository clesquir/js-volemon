import GameListener from './GameListener.js';
import {ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_INVINCIBLE_MONSTER} from '/imports/api/games/bonusConstants.js';

export default class InvincibleInALifetime extends GameListener {
	allowedForTournamentGame() {
		const tournamentMode = this.tournamentMode();

		return !tournamentMode.overridesAvailableBonuses();
	}

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
			event.activatedBonusClass === BONUS_INVINCIBLE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.incrementNumber(ACHIEVEMENT_INVINCIBLE_IN_A_LIFETIME);
		}
	}
}
