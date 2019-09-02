import {ACHIEVEMENT_SNOOZER} from '/imports/api/achievements/constants.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import PointTaken from '/imports/api/games/events/PointTaken';
import GameListener from './GameListener';

export default class Snoozer extends GameListener {
	allowedForGameOverride() {
		const gameOverride = this.gameOverride();

		return !gameOverride.overridesMaximumPoints() || gameOverride.maximumPoints() === GAME_MAXIMUM_POINTS;
	}

	addListeners() {
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			(
				(this.isPlayerHostSide() && event.clientPoints === this.gameMaximumPoints() - 1 && event.hostPoints === 0) ||
				(this.isPlayerClientSide() && event.hostPoints === this.gameMaximumPoints() - 1 && event.clientPoints === 0)
			)
		) {
			this.hasBeenMatchPointZero = true;
		}
	}

	/**
	 * @param {PlayerWon} event
	 */
	onPlayerWon(event) {
		if (
			event.gameId === this.gameId &&
			event.userId === this.userId &&
			this.hasBeenMatchPointZero
		) {
			this.incrementNumber(ACHIEVEMENT_SNOOZER);
		}
	}
}
