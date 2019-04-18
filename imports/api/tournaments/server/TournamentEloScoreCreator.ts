import EloScoreCreator from '../../games/server/EloScoreCreator';
import {TournamentEloScores} from '../tournamentEloScores';

export default class TournamentEloScoreCreator extends EloScoreCreator {
	tournamentId: string;

	constructor(tournamentId: string) {
		super();
		this.tournamentId = tournamentId;
	}

	insert(data) {
		if (data.userId !== 'CPU') {
			TournamentEloScores.insert(
				Object.assign(
					{tournamentId: this.tournamentId},
					data
				)
			);
		}
	}
}
