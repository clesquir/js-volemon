import GameListener from './GameListener';
import {ACHIEVEMENT_PAUSE_IN_A_GAME} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import {BONUS_FREEZE_MONSTER} from '/imports/api/games/bonusConstants';

export default class PauseInAGame extends GameListener {
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
			event.activatedBonusClass === BONUS_FREEZE_MONSTER &&
			this.playerKeyIsUser(event.targetPlayerKey)
		) {
			this.incrementNumberIfHigherWithNumberSinceLastReset(ACHIEVEMENT_PAUSE_IN_A_GAME);
		}
	}
}
