import SerialWinner from './listeners/SerialWinner';
import OneOfTheThree from './listeners/OneOfTheThree';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export default class TournamentListeners {
	init(userId) {
		const tournaments = Tournaments.find();

		tournaments.forEach((tournament) => {
			(new SerialWinner()).forTournament(tournament._id, userId);
			(new OneOfTheThree()).forTournament(tournament._id, userId);
		});
	}
}
