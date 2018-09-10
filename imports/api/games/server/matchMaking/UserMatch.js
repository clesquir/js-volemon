import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import GameCreator from '/imports/api/games/server/GameCreator.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class UserMatch {
	static match(modeSelection, isPracticeGame, tournamentId, matchedUsers) {
		const gameId = GameCreator.fromMatchMaker(matchedUsers, modeSelection, isPracticeGame, tournamentId);

		const userIds = [];
		const matchedUsersWithInformation = [];
		for (let i = 0; i < matchedUsers.length; i++) {
			const user = matchedUsers[i];
			userIds.push(user.id);
			matchedUsersWithInformation.push(
				{
					id: user.id,
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

	static removeMatch(gameId) {
		const game = Games.findOne(gameId);

		if (game) {
			MatchMakers.update(
				{modeSelection: game.modeSelection, tournamentId: game.tournamentId},
				{$pull: {matched: {gameId: gameId}}}
			);
		}
	}
}
