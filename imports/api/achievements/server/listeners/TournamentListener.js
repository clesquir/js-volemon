import * as Moment from 'meteor/momentjs:moment';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import Listener from './Listener';

export default class TournamentListener extends Listener {
	/**
	 * @param tournamentId
	 * @param userId
	 * @returns {Listener}
	 */
	forTournament(tournamentId, userId) {
		this.tournamentId = tournamentId;
		this.userId = userId;

		this.addListeners();

		return this;
	}

	tournamentFinished() {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		return (tournament && Moment.moment(tournament.endDate, "YYYY-MM-DD ZZ").diff(new Date()) < 0);
	}
}
