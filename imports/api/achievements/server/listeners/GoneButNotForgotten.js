import PlayerKilled from '/imports/api/games/events/PlayerKilled.js';
import GameListener from './GameListener.js';
import {ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN} from '/imports/api/achievements/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken.js';

export default class GoneButNotForgotten extends GameListener {
	addListeners() {
		this.addListener(PointTaken.prototype.constructor.name, this.onPointTaken);
		this.addListener(PlayerKilled.prototype.constructor.name, this.onPlayerKilled);
	}

	removeListeners() {
		this.removeListener(PlayerKilled.prototype.constructor.name, this.onPlayerKilled);
		this.removeListener(PointTaken.prototype.constructor.name, this.onPointTaken);
	}

	/**
	 * @param {PlayerKilled} event
	 */
	onPlayerKilled(event) {
		if (event.gameId === this.gameId) {
			if (this.playerKeyIsUser(event.playerKey)) {
				this.currentPlayerIsKilled = true;
			} else if (
				this.is2Vs2Game() &&
				this.playerKeyIsTeammate(event.playerKey)
			) {
				this.teammatePlayerIsKilled = true;
			}
		}
	}

	/**
	 * @param {PointTaken} event
	 */
	onPointTaken(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			if (this.isPlayerHostSide() === event.pointScoredByHost) {
				if (this.is2Vs2Game()) {
					if (this.currentPlayerIsKilled && this.teammatePlayerIsKilled) {
						this.incrementNumber(ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN);
					}
				} else {
					if (this.currentPlayerIsKilled) {
						this.incrementNumber(ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN);
					}
				}
			}

			this.currentPlayerIsKilled = false;
			this.teammatePlayerIsKilled = false;
		}
	}
}
