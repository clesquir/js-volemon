import GameListener from './GameListener';
import {ACHIEVEMENT_GAMES_PLAYED} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished';

export default class GamesPlayed extends GameListener {
	allowedForPracticeGame() {
		return true;
	}

	addListeners() {
		this.addListener(GameFinished.getClassName(), this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.getClassName(), this.onGameFinished);
	}

	/**
	 * @param {GameFinished} event
	 */
	onGameFinished(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			this.incrementNumber(ACHIEVEMENT_GAMES_PLAYED);
		}
	}
}
