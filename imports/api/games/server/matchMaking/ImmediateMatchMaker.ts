import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TWO_VS_TWO_GAME_MODE
} from "../../constants";
import MatchMaker from "./MatchMaker";

export default class ImmediateMatchMaker extends MatchMaker {
	protected matchedUsers(match: any): {id: string, name: string, isMachineLearning?: boolean}[] {
		let gameMode = this.gameMode(match);

		switch (gameMode) {
			case ONE_VS_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', name: 'CPU'}];
			case ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', isMachineLearning: true, name: 'ML CPU'}];
			case ONE_VS_ONE_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					return match.usersToMatch;
				}
				break;
			case TWO_VS_TWO_GAME_MODE:
				if (match.usersToMatch.length === 4) {
					return match.usersToMatch;
				}
				break;
		}

		return [];
	}
}
