import GameOverride from "./GameOverride";
import OneVersusOneVolleyball from "./gameOverride/OneVersusOneVolleyball";
import OneVersusOneSoccer from "./gameOverride/OneVersusOneSoccer";
import TwoVersusTwoVolleyball from "./gameOverride/TwoVersusTwoVolleyball";
import TwoVersusTwoSoccer from "./gameOverride/TwoVersusTwoSoccer";
import GameOverrideMode from "./gameOverride/GameOverrideMode";

export default class GameOverrideFactory {
	static isTwoVersusTwoGameMode(gameMode: string): boolean {
		const twoVersusTwoGameOverrideModes = this.twoVersusTwoGameOverrideModes();

		for (let gameOverrideMode of twoVersusTwoGameOverrideModes) {
			if (gameOverrideMode.gameModeCode() === gameMode) {
				return true;
			}
		}

		return false;
	}

	static gameModeHasGameOverride(gameMode: string): boolean {
		const gameOverrideModes = this.gameOverrideModes();

		for (let gameOverrideMode of gameOverrideModes) {
			if (gameOverrideMode.gameModeCode() === gameMode) {
				return true;
			}
		}

		return false;
	}

	static nameFromGameMode(gameMode: string) {
		return this.gameOverrideModeFromGameMode(gameMode).gameModeName();
	}

	static gameOverrideModeFromGameMode(gameMode: string): GameOverrideMode {
		const gameOverrideModes = this.gameOverrideModes();

		for (let gameOverrideMode of gameOverrideModes) {
			if (gameOverrideMode.gameModeCode() === gameMode) {
				return gameOverrideMode;
			}
		}

		throw `No GameOverride for gameMode ${gameMode}`;
	}

	static fromGameMode(gameMode: string): GameOverride {
		return GameOverride.fromData(this.gameOverrideModeFromGameMode(gameMode).gameOverride());
	}

	static fromTournament(tournament: {gameOverride: any}): GameOverride {
		return GameOverride.fromData(tournament.gameOverride);
	}

	static oneVersusOneGameOverrideModes(): GameOverrideMode[] {
		const gameOverrideModes = this.gameOverrideModes();
		const oneVersusOneGameOverrideModes = [];

		for (let gameOverrideMode of gameOverrideModes) {
			if (gameOverrideMode.isOneVersusOne()) {
				oneVersusOneGameOverrideModes.push(gameOverrideMode);
			}
		}

		return oneVersusOneGameOverrideModes;
	}

	static twoVersusTwoGameOverrideModes(): GameOverrideMode[] {
		const gameOverrideModes = this.gameOverrideModes();
		const oneVersusOneGameOverrideModes = [];

		for (let gameOverrideMode of gameOverrideModes) {
			if (gameOverrideMode.isTwoVersusTwo()) {
				oneVersusOneGameOverrideModes.push(gameOverrideMode);
			}
		}

		return oneVersusOneGameOverrideModes;
	}

	private static gameOverrideModes(): GameOverrideMode[] {
		return [
			OneVersusOneVolleyball.create(),
			OneVersusOneSoccer.create(),
			TwoVersusTwoVolleyball.create(),
			TwoVersusTwoSoccer.create(),
		];
	}
}
