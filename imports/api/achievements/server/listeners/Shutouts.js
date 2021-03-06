import {ACHIEVEMENT_SHUTOUTS} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import GameListener from './GameListener';

export default class Shutouts extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesMaximumPoints() || gameOverride.maximumPoints() === GAME_MAXIMUM_POINTS;
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
			this.incrementNumber(ACHIEVEMENT_SHUTOUTS);
		}
	}
}
