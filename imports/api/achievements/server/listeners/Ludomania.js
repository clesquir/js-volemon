import {ACHIEVEMENT_LUDOMANIA} from '/imports/api/achievements/constants.js';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import TournamentListener from './TournamentListener';

export default class Ludomania extends TournamentListener {
	addListeners() {
		this.addListener(TournamentFinished.getClassName(), this.onTournamentFinished);
	}

	removeListeners() {
		this.removeListener(TournamentFinished.getClassName(), this.onTournamentFinished);
	}

	/**
	 * @param {TournamentFinished} event
	 */
	onTournamentFinished(event) {
		if (
			event.tournamentId === this.tournamentId &&
			this.tournamentFinished()
		) {
			const tournamentProfile = TournamentProfiles.findOne({tournamentId: this.tournamentId, userId: this.userId});

			if (tournamentProfile) {
				this.incrementNumber(ACHIEVEMENT_LUDOMANIA);
			}
		}
	}
}
