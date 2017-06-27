import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_FULL_STOP} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import {PLAYER_SHAPE_DOT} from '/imports/api/games/shapeConstants.js'

export default class FullStop extends Listener {
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
			event.winnerPoints === GAME_MAXIMUM_POINTS &&
			event.loserPoints === 0 &&
			this.currentPlayerShape() === PLAYER_SHAPE_DOT &&
			this.oppositePlayerShape() !== PLAYER_SHAPE_DOT
		) {
			this.incrementNumber(ACHIEVEMENT_FULL_STOP);
		}
	}
}
