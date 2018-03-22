import {ACHIEVEMENT_FULL_STOP} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {PLAYER_SHAPE_DOT} from '/imports/api/games/shapeConstants.js'
import GameListener from './GameListener.js';

export default class FullStop extends GameListener {
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
			event.userId === this.userId &&
			event.winnerPoints === this.gameMaximumPoints() &&
			event.loserPoints === 0 &&
			this.currentPlayerShape() === PLAYER_SHAPE_DOT &&
			this.oppositePlayerShape() !== PLAYER_SHAPE_DOT
		) {
			this.incrementNumber(ACHIEVEMENT_FULL_STOP);
		}
	}
}
