import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_TRIPLE_COLON} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {PLAYER_SHAPE_TRIPLE_COLON} from '/imports/api/games/shapeConstants.js'

export default class TripleColon extends Listener {
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
			this.currentPlayerShape() === PLAYER_SHAPE_TRIPLE_COLON &&
			this.oppositePlayerShape() !== PLAYER_SHAPE_TRIPLE_COLON
		) {
			this.incrementNumber(ACHIEVEMENT_TRIPLE_COLON);
		}
	}
}
