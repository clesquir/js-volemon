import GameOverride from "./GameOverride";
import TwoVersusTwoVolleyball from "./gameOverride/TwoVersusTwoVolleyball";
import OneVersusOneVolleyball from "./gameOverride/OneVersusOneVolleyball";

export default class GameOverrideFactory {
	static gameModeHasGameOverride(gameMode: string): boolean {
		return [
			OneVersusOneVolleyball.gameModeCode(),
			TwoVersusTwoVolleyball.gameModeCode(),
		].indexOf(gameMode) !== -1;
	}

	static fromGameMode(gameMode: string): GameOverride {
		switch (gameMode) {
			case OneVersusOneVolleyball.gameModeCode():
				return GameOverride.fromData(OneVersusOneVolleyball.gameOverride());
			case TwoVersusTwoVolleyball.gameModeCode():
				return GameOverride.fromData(TwoVersusTwoVolleyball.gameOverride());
		}

		throw `No GameOverride for gameMode ${gameMode}`;
	}

	static fromTournament(tournament: {gameOverride: any}): GameOverride {
		return GameOverride.fromData(tournament.gameOverride);
	}
}
