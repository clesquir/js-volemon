import GameConfiguration from './GameConfiguration';
import {Games} from '/imports/api/games/games.js';
import TournamentModeFactory from '/imports/api/tournaments/modes/TournamentModeFactory.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export default class DefaultGameConfiguration extends GameConfiguration {
	init() {
		let game = Games.findOne({_id: this.gameId});

		this.tournamentId = game.tournamentId;

		if (this.hasTournament()) {
			this.initTournament();
		}
	}

	/**
	 * @private
	 */
	initTournament() {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		/** @type Classic */
		this.tournamentMode = TournamentModeFactory.fromId(tournament.mode._id);
	}
}
