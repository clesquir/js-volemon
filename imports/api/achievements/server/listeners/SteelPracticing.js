import {ACHIEVEMENT_STEEL_PRACTICING} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE} from '/imports/api/games/constants';
import GameListener from './GameListener';

export default class SteelPracticing extends GameListener {
	allowedForGameMode(gameMode) {
		return gameMode === ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE;
	}

	allowedForPracticeGame() {
		return true;
	}

	addListeners() {
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId &&
			event.winnerPoints === this.gameMaximumPoints() &&
			event.loserPoints === 0
		) {
			this.incrementNumber(ACHIEVEMENT_STEEL_PRACTICING);
		}
	}
}
