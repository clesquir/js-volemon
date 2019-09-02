import GameListener from './GameListener';
import {ACHIEVEMENT_GAME_TIME} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished';

export default class GameTime extends GameListener {
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
			this.updateNumberIfHigher(ACHIEVEMENT_GAME_TIME, event.gameDuration);
		}
	}
}
