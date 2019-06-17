import * as moment from 'moment';
import {Tournaments} from '../../../tournaments/tournaments';
import Listener from './Listener';

export default class TournamentListener extends Listener {
	tournamentId: string;

	forTournament(tournamentId: string, userId: string): Listener {
		this.tournamentId = tournamentId;
		this.userId = userId;

		this.addListeners();

		return this;
	}

	tournamentFinished(): boolean {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		return (tournament && moment(tournament.endDate, "YYYY-MM-DD ZZ").diff(new Date()) < 0);
	}
}
