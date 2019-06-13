import {ACHIEVEMENT_STEEL_PRACTICING} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import GameListener from './GameListener';

export default class SteelPracticing extends GameListener {
	allowedForTournamentGame() {
		return false;
	}

	allowedForPracticeGame() {
		return true;
	}

	allowedFor2Vs2() {
		return false;
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
			event.loserPoints === 0 &&
			this.is1VsMLCpuGame()
		) {
			this.incrementNumber(ACHIEVEMENT_STEEL_PRACTICING);
		}
	}
}
