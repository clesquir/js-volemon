import GameConfiguration from './GameConfiguration';
import GameOverrideFactory from "../GameOverrideFactory";

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
		if (GameOverrideFactory.gameModeHasGameOverride(this.gameMode)) {
			this.gameOverride = GameOverrideFactory.fromGameMode(this.gameMode);
		}

		if (this.hasTournament()) {
			this.initTournament();
		}
	}

	private initTournament() {
		this.tournament = this.tournamentsCollection.findOne({_id: this.tournamentId});
		this.gameOverride = GameOverrideFactory.fromTournament(this.tournament);
	}
}
