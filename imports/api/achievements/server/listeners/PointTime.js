import GameListener from './GameListener';
import {ACHIEVEMENT_POINT_TIME} from '/imports/api/achievements/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';

export default class PointTime extends GameListener {
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
			this.userIsGamePlayer()
		) {
			this.updateNumberIfHigher(ACHIEVEMENT_POINT_TIME, event.pointDuration);
		}
	}
}
