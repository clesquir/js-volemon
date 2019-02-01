import TournamentMode from '../../tournaments/TournamentMode';
import GameConfiguration from './GameConfiguration';

export default class MatchMakingGameConfiguration extends GameConfiguration {
	tournamentsCollection: any;

	constructor(modeSelection: string, tournamentsCollection: any, tournamentId?: string) {
		super();

		this.gameMode = modeSelection;
		this.tournamentsCollection = tournamentsCollection;
		this.tournamentId = tournamentId;

		this.init();
	}

	hasTournament(): boolean {
		return !!this.tournamentId && !!this.tournamentsCollection.findOne({_id: this.tournamentId});
	}

	private init() {
		if (this.hasTournament()) {
			this.initTournament();
		}
	}

	private initTournament() {
		this.tournament = this.tournamentsCollection.findOne({_id: this.tournamentId});

		this.tournamentMode = TournamentMode.fromTournament(this.tournament);
	}
}
