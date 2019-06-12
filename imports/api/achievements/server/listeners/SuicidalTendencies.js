import GameListener from './GameListener.js';
import {ACHIEVEMENT_SUICIDAL_TENDENCIES} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught.js';
import {BONUS_RANDOM, BONUS_INSTANT_DEATH} from '/imports/api/games/bonusConstants';

export default class SuicidalTendencies extends GameListener {
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
			this.playerKeyIsUser(event.targetPlayerKey) &&
			this.hasInstantDeathBonusAvailable()
		) {
			this.incrementNumber(ACHIEVEMENT_SUICIDAL_TENDENCIES);
		}
	}

	hasInstantDeathBonusAvailable() {
		if (this.isTournamentGame()) {
			const tournamentMode = this.tournamentMode();

			return (
				tournamentMode.overridesAvailableBonuses() &&
				tournamentMode.availableBonuses().indexOf(BONUS_INSTANT_DEATH) !== -1
			);
		}

		return false;
	}
}
