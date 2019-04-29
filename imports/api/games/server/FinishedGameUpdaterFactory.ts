import ProfileUpdater from "../../profiles/server/ProfileUpdater";
import EloScoreCreator from "./EloScoreCreator";
import TournamentProfileUpdater from "../../tournaments/server/TournamentProfileUpdater";
import TournamentEloScoreCreator from "../../tournaments/server/TournamentEloScoreCreator";
import FinishedGameUpdater from "./FinishedGameUpdater";
import {isTwoVersusTwoGameMode} from "../constants";
import TeamProfileUpdater from "../../profiles/server/TeamProfileUpdater";
import TeamEloScoreCreator from "./TeamEloScoreCreator";

export default class FinishedGameUpdaterFactory {
	static fromGame(game): FinishedGameUpdater {
		let profileUpdater = null;
		let eloScoreCreator = null;
		let tournamentProfileUpdater = null;
		let tournamentEloScoreCreator = null;

		if (isTwoVersusTwoGameMode(game.gameMode)) {
			profileUpdater = new TeamProfileUpdater();
			eloScoreCreator = new TeamEloScoreCreator();
		} else {
			profileUpdater = new ProfileUpdater();
			eloScoreCreator = new EloScoreCreator();
		}

		if (game.tournamentId) {
			tournamentProfileUpdater = new TournamentProfileUpdater(game.tournamentId);
			tournamentEloScoreCreator = new TournamentEloScoreCreator(game.tournamentId);
		}

		return new FinishedGameUpdater(
			profileUpdater,
			eloScoreCreator,
			tournamentProfileUpdater,
			tournamentEloScoreCreator
		);
	}
}
