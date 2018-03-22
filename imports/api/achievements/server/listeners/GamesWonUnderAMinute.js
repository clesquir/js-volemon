import {ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Games} from '/imports/api/games/games.js';
import GameListener from './GameListener.js';

export default class GamesWonUnderAMinute extends GameListener {
	allowedForTournamentGame() {
		const tournamentMode = this.tournamentMode();

		return !tournamentMode.overridesMaximumPoints() || tournamentMode.maximumPoints() === GAME_MAXIMUM_POINTS;
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
			const game = Games.findOne({_id: this.gameId});
			if (game.gameDuration < 60000) {
				this.incrementNumber(ACHIEVEMENT_GAMES_WON_UNDER_A_MINUTE);
			}
		}
	}
}
