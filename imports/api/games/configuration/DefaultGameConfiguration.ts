import {isTwoVersusTwoGameMode} from '../constants';
import {Games} from '../games';
import LevelConfiguration from '../levelConfiguration/LevelConfiguration';
import TournamentMode from '../../tournaments/TournamentMode';
import {Tournaments} from '../../tournaments/tournaments';
import GameConfiguration from './GameConfiguration';

export default class DefaultGameConfiguration extends GameConfiguration {
	gameId: string;

	constructor(gameId: string) {
		super();
		this.gameId = gameId;

		this.init();
	}

	private init() {
		let game = Games.findOne({_id: this.gameId});

		if (!game) {
			return;
		}

		this.gameMode = game.gameMode;
		this.tournamentId = game.tournamentId;

		if (this.hasTournament()) {
			this.initTournament();
		}

		this.initLevelConfiguration();
	}

	private initTournament() {
		this.tournament = Tournaments.findOne({_id: this.tournamentId});

		/** @type TournamentMode */
		this.tournamentMode = TournamentMode.fromTournament(this.tournament);
	}

	private initLevelConfiguration() {
		if (this.hasTournament() && this.tournamentMode.overridesLevelSize()) {
			this.levelConfiguration = LevelConfiguration.defaultConfiguration();
			this.levelConfiguration = LevelConfiguration.definedSize(
				this.tournamentMode.overridesLevelWidth() ? this.tournamentMode.levelWidth() : this.levelConfiguration.width,
				this.tournamentMode.overridesLevelHeight() ? this.tournamentMode.levelHeight() : this.levelConfiguration.height
			);
		} else {
			if (isTwoVersusTwoGameMode(this.gameMode)) {
				this.levelConfiguration = LevelConfiguration.defaultTwoVersusTwoConfiguration();
			} else {
				this.levelConfiguration = LevelConfiguration.defaultConfiguration();
			}
		}
	}
}
