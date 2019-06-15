import {
	isTwoVersusTwoGameMode,
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE
} from "../../constants";
import MatchMaker from "./MatchMaker";

export default class ImmediateMatchMaker extends MatchMaker {
	protected matchedUsers(match: any): {id: string, name: string, isMachineLearning?: boolean}[] {
		let gameMode = this.gameMode(match);

		if (gameMode === ONE_VS_COMPUTER_GAME_MODE) {
			return [match.usersToMatch[0], {id: 'CPU', name: 'CPU'}];
		} else if (gameMode === ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE) {
			return [match.usersToMatch[0], {id: 'CPU', isMachineLearning: true, name: 'ML CPU'}];
		} else if (isTwoVersusTwoGameMode(gameMode)) {
			if (match.usersToMatch.length === 4) {
				return match.usersToMatch;
			}
		} else {
			if (match.usersToMatch.length === 2) {
				return match.usersToMatch;
			}
		}

		return [];
	}
}
