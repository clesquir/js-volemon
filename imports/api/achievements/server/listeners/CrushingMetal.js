import {ACHIEVEMENT_CRUSHING_METAL} from '/imports/api/achievements/constants.js';
import {ONE_VS_COMPUTER_GAME_MODE} from '/imports/api/games/constants';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import GameListener from './GameListener';

export default class CrushingMetal extends GameListener {
	allowedForGameMode(gameMode) {
		return gameMode === ONE_VS_COMPUTER_GAME_MODE;
	}

	allowedForPracticeGame() {
		return true;
	}

	addListeners() {
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
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
			this.incrementNumber(ACHIEVEMENT_CRUSHING_METAL);
		}
	}
}
