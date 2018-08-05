import {TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import LevelConfiguration from '/imports/api/games/levelConfiguration/LevelConfiguration.js';
import TournamentMode from '/imports/api/tournaments/TournamentMode.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import GameConfiguration from './GameConfiguration.js';

export default class DefaultGameConfiguration extends GameConfiguration {
	/**
	 * @param {string} gameId
	 */
	constructor(gameId) {
		super();
		this.gameId = gameId;

		this.init();
	}

	/**
	 * @private
	 */
	init() {
		let game = Games.findOne({_id: this.gameId});

		if (!game) {
			return;
		}

		this.tournamentId = game.tournamentId;

		if (this.hasTournament()) {
			this.initTournament();
		}

		this.initLevelConfiguration();
	}

	/**
	 * @private
	 */
	initTournament() {
		const tournament = Tournaments.findOne({_id: this.tournamentId});

		/** @type TournamentMode */
		this.tournamentMode = TournamentMode.fromTournament(tournament);
	}

	/**
	 * @private
	 */
	initLevelConfiguration() {
		if (this.hasTournament() && this.tournamentMode.overridesLevelSize()) {
			this.levelConfiguration = LevelConfiguration.definedSize(
				this.tournamentMode.levelSize().width,
				this.tournamentMode.levelSize().height
			);
		} else {
			let game = Games.findOne({_id: this.gameId});

			if (game && game.gameMode === TWO_VS_TWO_GAME_MODE) {
				this.levelConfiguration = LevelConfiguration.defaultTwoVersusTwoConfiguration();
			} else {
				this.levelConfiguration = LevelConfiguration.defaultConfiguration();
			}
		}
	}
}
