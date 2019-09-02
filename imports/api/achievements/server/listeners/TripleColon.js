import GameListener from './GameListener';
import {ACHIEVEMENT_TRIPLE_COLON} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import {PLAYER_SHAPE_TRIPLE_COLON} from '/imports/api/games/shapeConstants.js'

export default class TripleColon extends GameListener {
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
			this.currentPlayerShape() === PLAYER_SHAPE_TRIPLE_COLON &&
			this.oppositePlayerShape() !== PLAYER_SHAPE_TRIPLE_COLON
		) {
			this.incrementNumber(ACHIEVEMENT_TRIPLE_COLON);
		}
	}
}
