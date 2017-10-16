import GameListener from './GameListener.js';
import {ACHIEVEMENT_DAVID_VS_GOLIATH} from '/imports/api/achievements/constants.js';
import PlayerWon from '/imports/api/games/events/PlayerWon.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

export default class DavidVsGoliath extends GameListener {
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
			const opponentPlayer = Players.findOne({gameId: this.gameId, userId: {$ne: this.userId}});
			const opponentProfile = Profiles.findOne({userId: opponentPlayer.userId});
			const currentProfile = Profiles.findOne({userId: this.userId});

			if (opponentProfile && currentProfile && opponentProfile.eloRating >= currentProfile.eloRating + 150) {
				this.incrementNumber(ACHIEVEMENT_DAVID_VS_GOLIATH);
			}
		}
	}
}
