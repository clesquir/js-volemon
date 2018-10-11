import TournamentMode from '/imports/api/tournaments/TournamentMode.js';
import GameConfiguration from './GameConfiguration.js';

export default class MatchMakingGameConfiguration extends GameConfiguration {
	/**
	 * @param {string} modeSelection
	 * @param tournamentsCollection
	 * @param {string} tournamentId
	 */
	constructor(modeSelection, tournamentsCollection, tournamentId) {
		super();
		this.gameMode = modeSelection;
		this.tournamentsCollection = tournamentsCollection;
		this.tournamentId = tournamentId;

		this.init();
	}

	/**
	 * @private
	 */
	init() {
		if (this.hasTournament()) {
			this.initTournament();
		}
	}

	hasTournament() {
		return !!this.tournamentId && !!this.tournamentsCollection.findOne({_id: this.tournamentId});
	}

	/**
	 * @private
	 */
	initTournament() {
		const tournament = this.tournamentsCollection.findOne({_id: this.tournamentId});

		/** @type TournamentMode */
		this.tournamentMode = TournamentMode.fromTournament(tournament);
	}
}
