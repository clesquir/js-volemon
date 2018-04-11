import {MatchMakers} from '/imports/api/games/matchMakers.js';
import GameCreator from '/imports/api/games/server/GameCreator.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class UserMatch {
	static match(modeSelection, tournamentId, matchedUsers) {
		const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});
		const gameId = GameCreator.fromMatchMaker(matchedUsers, modeSelection, tournamentId);

		//Remove from usersToMatch
		let remainingUsersToMatch = match.usersToMatch;
		for (let userId of matchedUsers) {
			const index = remainingUsersToMatch.indexOf(userId);
			if (index !== -1) {
				remainingUsersToMatch.splice(index, 1);
			}
		}
		MatchMakers.update({_id: match._id}, {$set: {usersToMatch: remainingUsersToMatch}});

		//Add to matched with gameId
		let matched = match.matched.concat({
			users: matchedUsers,
			gameId: gameId
		});
		MatchMakers.update({_id: match._id}, {$set: {matched: matched}});

		//Remove matched after a while
		Meteor.setTimeout(() => {
			const match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

			matched = match.matched;
			for (let i = 0; i < matched.length; i++) {
				let item = matched[i];
				if (matched[i].gameId === gameId) {
					matched.splice(i, 1);
					break;
				}
			}

			MatchMakers.update({_id: match._id}, {$set: {matched: matched}});
		}, 10000);
	}
}
