import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TWO_VS_TWO_GAME_MODE
} from "../../constants";
import MatchMaker from "./MatchMaker";

export default class RandomMatchMaker extends MatchMaker {
	protected matchedUsers(match: any): {id: string, name: string, isMachineLearning?: boolean}[] {
		let gameMode = this.gameMode(match);

		switch (gameMode) {
			case ONE_VS_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', name: 'CPU'}];
			case ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', isMachineLearning: true, name: 'ML CPU'}];
			case ONE_VS_ONE_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					return this.randomizeUsers(match.usersToMatch);
				}
				break;
			case TWO_VS_TWO_GAME_MODE:
				if (match.usersToMatch.length === 4) {
					if (this.numberOfMatchedComputers(match.usersToMatch) === 2) {
						const matchedComputers = this.getMatchedComputers(match.usersToMatch);
						const matchedHumans = this.getMatchedHumans(match.usersToMatch);

						return [
							matchedHumans[0],
							matchedHumans[1],
							matchedComputers[0],
							matchedComputers[1],
						];
					} else {
						return this.randomizeUsers(match.usersToMatch);
					}
				}
				break;
		}

		return [];
	}
}
