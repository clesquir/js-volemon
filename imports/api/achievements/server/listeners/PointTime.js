import Listener from '/imports/api/achievements/server/listeners/Listener.js';
import {ACHIEVEMENT_POINT_TIME} from '/imports/api/achievements/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';

export default class PointTime extends Listener {
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
