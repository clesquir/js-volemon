import {ACHIEVEMENT_SERIAL_WINNER} from '/imports/api/achievements/constants.js';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import TournamentListener from './TournamentListener';

export default class SerialWinner extends TournamentListener {
	addListeners() {
		this.addListener(TournamentFinished.prototype.constructor.name, this.onTournamentFinished);
	}

	removeListeners() {
		this.removeListener(TournamentFinished.prototype.constructor.name, this.onTournamentFinished);
	}

	/**
	 * @param {TournamentFinished} event
	 */
	onTournamentFinished(event) {
		if (
			event.tournamentId === this.tournamentId &&
			this.tournamentFinished()
		) {
			const tournamentProfile = TournamentProfiles.findOne({tournamentId: this.tournamentId}, {sort: [['eloRating', 'desc']]});

			if (tournamentProfile && tournamentProfile.userId === this.userId) {
				this.incrementNumber(ACHIEVEMENT_SERIAL_WINNER);
			}
		}
	}
}
