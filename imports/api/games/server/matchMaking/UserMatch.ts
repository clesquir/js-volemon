import {Games} from "../../games";
import {MatchMakers} from "../../matchMakers";
import GameCreator from "../GameCreator";

export default class UserMatch {
	static match(
		modeSelection: string,
		tournamentId: string,
		matchedUsers: {id: string, connectionId?: string, name: string, isMachineLearning?: boolean}[]
	) {
		const gameId = GameCreator.fromMatchMaker(matchedUsers, modeSelection, tournamentId);

		const userIds = [];
		const matchedUsersWithInformation = [];
		for (let i = 0; i < matchedUsers.length; i++) {
			const user = matchedUsers[i];
			userIds.push(user.id);
			matchedUsersWithInformation.push(
				{
					id: user.id,
					connectionId: user.connectionId,
					isMachineLearning: user.isMachineLearning,
					name: user.name,
					position: i + 1,
					isReady: user.id === 'CPU'
				}
			);
		}

		//Remove from usersToMatch
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$pull: {usersToMatch: {id: {$in: userIds}}}}
		);

		//Add to matched with gameId
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{
				$push: {
					matched: {
						users: matchedUsersWithInformation,
						gameId: gameId
					}
				}
			}
		);
	}

	static removeMatch(gameId: string) {
		const game = Games.findOne(gameId);

		if (game) {
			MatchMakers.update(
				{modeSelection: game.modeSelection, tournamentId: game.tournamentId},
				{$pull: {matched: {gameId: gameId}}}
			);
		}
	}
}
