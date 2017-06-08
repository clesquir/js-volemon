import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_SNOOZER} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';
import {GAME_MAXIMUM_POINTS} from '/imports/api/games/constants.js';

export default class Snoozer extends Listener {
	addListeners() {
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
		this.addListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
		this.removeListener(PlayerWon.prototype.constructor.name, this.onPlayerWon);
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			(
				(this.playerIsHost() && event.clientPoints === GAME_MAXIMUM_POINTS - 1 && event.hostPoints === 0) ||
				(this.playerIsClient() && event.hostPoints === GAME_MAXIMUM_POINTS - 1 && event.clientPoints === 0)
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
