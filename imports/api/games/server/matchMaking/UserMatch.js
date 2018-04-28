import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import GameCreator from '/imports/api/games/server/GameCreator.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class UserMatch {
	static match(modeSelection, tournamentId, matchedUsers) {
		const gameId = GameCreator.fromMatchMaker(matchedUsers, modeSelection, tournamentId);

		//Remove from usersToMatch
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$pull: {usersToMatch: {$in: matchedUsers}}}
		);

		//Add to matched with gameId
		let matchedItem = {
			users: matchedUsers,
			gameId: gameId
		};
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$push: {matched: matchedItem}}
		);
	}

	static removeMatch(gameId) {
		//timeout to allow some time to users to get the game info
		Meteor.setTimeout(() => {
			const game = Games.findOne(gameId);

			if (game) {
				MatchMakers.update(
					{modeSelection: game.modeSelection, tournamentId: game.tournamentId},
					{$pull: {matched: {gameId: gameId}}}
				);
			}
		}, 5000);
	}
}
