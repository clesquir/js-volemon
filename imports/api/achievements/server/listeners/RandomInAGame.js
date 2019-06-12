import GameListener from './GameListener.js';
import {ACHIEVEMENT_RANDOM_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_RANDOM} from '/imports/api/games/bonusConstants';

export default class RandomInAGame extends GameListener {
	allowedForTournamentGame() {
		const tournamentMode = this.tournamentMode();

		return !tournamentMode.overridesAvailableBonuses() || tournamentMode.availableBonuses().length > 1;
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
			event.initialBonusClass === BONUS_RANDOM &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_RANDOM_IN_A_GAME);
		}
	}
}
