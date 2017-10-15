import EloScoreCreator from '/imports/api/games/server/EloScoreCreator.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';

export default class TournamentEloScoreCreator extends EloScoreCreator {
	constructor(tournamentId) {
		super();
		this.tournamentId = tournamentId;
	}

	insert(data) {
		TournamentEloScores.insert(
			Object.assign(
				{tournamentId: this.tournamentId},
				data
			)
		);
	}
}
