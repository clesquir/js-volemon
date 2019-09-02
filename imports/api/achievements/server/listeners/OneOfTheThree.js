import {ACHIEVEMENT_ONE_OF_THE_THREE} from '/imports/api/achievements/constants.js';
import TournamentFinished from '/imports/api/tournaments/events/TournamentFinished';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import TournamentListener from './TournamentListener';

export default class OneOfTheThree extends TournamentListener {
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
			const tournamentProfiles = TournamentProfiles.find({tournamentId: this.tournamentId}, {sort: [['eloRating', 'desc']], limit: 3});
			const eloRatings = {};

			tournamentProfiles.forEach(function(tournamentProfile) {
				if (!eloRatings[tournamentProfile.eloRating]) {
					eloRatings[tournamentProfile.eloRating] = [];
				}
				eloRatings[tournamentProfile.eloRating].push(tournamentProfile.userId);
			});

			for (let eloRating in eloRatings) {
				if (eloRatings.hasOwnProperty(eloRating)) {
					for (let userId of eloRatings[eloRating]) {
						if (userId === this.userId) {
							this.incrementNumber(ACHIEVEMENT_ONE_OF_THE_THREE);
						}
					}
				}
			}
		}
	}
}
