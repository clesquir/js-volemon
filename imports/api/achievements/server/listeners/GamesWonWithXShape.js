import GameListener from './GameListener';
import {ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {PLAYER_SHAPE_X} from '/imports/api/games/shapeConstants.js'

export default class GamesWonWithXShape extends GameListener {
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
			this.currentPlayerShape() === PLAYER_SHAPE_X
		) {
			this.incrementNumber(ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE);
		}
	}
}
