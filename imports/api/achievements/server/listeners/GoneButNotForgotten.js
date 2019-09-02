import PlayerKilled from '/imports/api/games/events/PlayerKilled';
import GameListener from './GameListener';
import {ACHIEVEMENT_GONE_BUT_NOT_FORGOTTEN} from '/imports/api/achievements/constants.js';
import PointTaken from '/imports/api/games/events/PointTaken';

export default class GoneButNotForgotten extends GameListener {
	addListeners() {
		this.addListener(PointTaken.getClassName(), this.onPointTaken);
		this.addListener(PlayerKilled.getClassName(), this.onPlayerKilled);
	}

	removeListeners() {
		this.removeListener(PlayerKilled.getClassName(), this.onPlayerKilled);
		this.removeListener(PointTaken.getClassName(), this.onPointTaken);
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
