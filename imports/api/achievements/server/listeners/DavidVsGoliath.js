import {ACHIEVEMENT_DAVID_VS_GOLIATH} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import GameListener from './GameListener.js';

export default class DavidVsGoliath extends GameListener {
	allowedFor2Vs2() {
		return false;
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
			const currentProfile = this.getCurrentPlayerProfile();
			const opponentProfile = this.getOppositePlayerProfile();

			if (opponentProfile && currentProfile && opponentProfile.eloRating >= currentProfile.eloRating + 150) {
				this.incrementNumber(ACHIEVEMENT_DAVID_VS_GOLIATH);
			}
		}
	}
}
