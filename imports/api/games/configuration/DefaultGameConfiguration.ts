import {isTwoVersusTwoGameMode} from '../constants';
import {Games} from '../games';
import LevelConfiguration from '../levelConfiguration/LevelConfiguration';
import {Tournaments} from '../../tournaments/tournaments';
import GameConfiguration from './GameConfiguration';
import GameOverrideFactory from "../GameOverrideFactory";

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

		if (GameOverrideFactory.gameModeHasGameOverride(this.gameMode)) {
			this.gameOverride = GameOverrideFactory.fromGameMode(this.gameMode);
		}

		if (this.hasTournament()) {
			this.initTournament();
		}

		this.initLevelConfiguration();
	}

	private initTournament() {
		this.tournament = Tournaments.findOne({_id: this.tournamentId});
		this.gameOverride = GameOverrideFactory.fromTournament(this.tournament);
	}

	private initLevelConfiguration() {
		if (this.hasGameOverride() && this.gameOverride.overridesLevelSize()) {
			this.levelConfiguration = LevelConfiguration.defaultConfiguration();
			this.levelConfiguration = LevelConfiguration.definedSize(
				this.gameOverride.overridesLevelWidth() ? this.gameOverride.levelWidth() : this.levelConfiguration.width,
				this.gameOverride.overridesLevelHeight() ? this.gameOverride.levelHeight() : this.levelConfiguration.height
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
