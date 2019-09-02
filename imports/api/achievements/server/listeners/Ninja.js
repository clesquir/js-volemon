import GameListener from './GameListener';
import {ACHIEVEMENT_NINJA} from '/imports/api/achievements/constants.js';
import BonusCaught from '/imports/api/games/events/BonusCaught';
import GameFinished from '/imports/api/games/events/GameFinished';

export default class Ninja extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesHasBonuses();
	}

	addListeners() {
		this.addListener(BonusCaught.getClassName(), this.onBonusCaught);
		this.addListener(GameFinished.getClassName(), this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.getClassName(), this.onGameFinished);
		this.removeListener(BonusCaught.getClassName(), this.onBonusCaught);
	}

	/**
	 * @param {BonusCaught} event
	 */
	onBonusCaught(event) {
		if (
			event.gameId === this.gameId &&
			this.playerKeyIsUser(event.activatorPlayerKey)
		) {
			this.hasCaughtBonus = true;
		}
	}

	/**
	 * @param {GameFinished} event
	 */
	onGameFinished(event) {
		if (
			event.gameId === this.gameId &&
			!this.hasCaughtBonus &&
			event.gameDuration > 120000 &&
			this.userIsGamePlayer()
		) {
			this.incrementNumber(ACHIEVEMENT_NINJA);
		}
	}
}
