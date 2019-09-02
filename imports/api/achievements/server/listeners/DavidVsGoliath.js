import {ACHIEVEMENT_DAVID_VS_GOLIATH} from '/imports/api/achievements/constants.js';
import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import PlayerWon from '/imports/api/games/events/PlayerWon';
import GameListener from './GameListener';

export default class DavidVsGoliath extends GameListener {
	allowedForGameMode(gameMode) {
		return !isTwoVersusTwoGameMode(gameMode);
	}

	addListeners() {
		this.addListener(PlayerWon.getClassName(), this.onPlayerWon);
	}

	removeListeners() {
		this.removeListener(PlayerWon.getClassName(), this.onPlayerWon);
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
