import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_X} from '/imports/api/games/shapeConstants.js'

export default class GamesWonWithXShape extends Listener {
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
			event.userId === this.userId
		) {
			const player = Players.findOne({gameId: this.gameId, userId: this.userId});

			if (player.shape === PLAYER_SHAPE_X) {
				this.incrementNumber(ACHIEVEMENT_GAMES_WON_WITH_X_SHAPE);
			}
		}
	}
}
