import TournamentMode from '/imports/api/tournaments/TournamentMode.js';
import GameConfiguration from './GameConfiguration.js';

export default class MatchMakingGameConfiguration extends GameConfiguration {
	/**
	 * @param tournamentsCollection
	 * @param {string} tournamentId
	 */
	constructor(tournamentsCollection, tournamentId) {
		super();
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
