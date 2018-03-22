import {ACHIEVEMENT_HOW_TO_TIE_A_TIE} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import GameListener from './GameListener.js';

export default class HowToTieATie extends GameListener {
	allowedForTournamentGame() {
		const tournamentMode = this.tournamentMode();

		return !tournamentMode.overridesMaximumPoints() || tournamentMode.maximumPoints() === GAME_MAXIMUM_POINTS;
	}

	addListeners() {
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	removeListeners() {
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			event.hostPoints === this.gameMaximumPoints() - 1 &&
			event.clientPoints === this.gameMaximumPoints() - 1 &&
			this.userIsGamePlayer()
		) {
			this.incrementNumber(ACHIEVEMENT_HOW_TO_TIE_A_TIE);
		}
	}
}
