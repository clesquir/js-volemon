import GameListener from './GameListener.js';
import {ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';

export default class GamesWonUnderAMinute extends GameListener {
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
			const game = Games.findOne({_id: this.gameId});
			if (game.gameDuration < 60000) {
				this.incrementNumber(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE);
			}
		}
	}
}
