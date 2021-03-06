import GameListener from './GameListener';
import {ACHIEVEMENT_RANDOM_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {BONUS_RANDOM} from '/imports/api/games/bonusConstants';

export default class RandomInAGame extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesAvailableBonuses() || gameOverride.availableBonuses().length > 1;
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
			event.initialBonusClass === BONUS_RANDOM &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_RANDOM_IN_A_GAME);
		}
	}
}
