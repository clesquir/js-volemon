import {ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import GameListener from './GameListener';

export default class GamesWonUnderAMinute extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesMaximumPoints() || gameOverride.maximumPoints() === GAME_MAXIMUM_POINTS;
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
			event.userId === this.userId
		) {
			const game = this.getGame();

			if (game && game.gameDuration < 60000) {
				this.incrementNumber(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE);
			}
		}
	}
}
