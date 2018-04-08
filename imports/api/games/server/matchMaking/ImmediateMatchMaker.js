import {MatchMakers} from '/imports/api/games/matchMakers.js';
import GameCreator from '/imports/api/games/server/GameCreator.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class ImmediateMatchMaker extends MatchMaker {
	subscribe(userId, modeSelection, tournamentId) {
		let match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match) {
			let usersToMatch = match.usersToMatch;

			if (usersToMatch.indexOf(userId) === -1) {
				//Add to the usersToMatch
				usersToMatch = usersToMatch.concat([userId]);
				MatchMakers.update({_id: match._id}, {$set: {usersToMatch: usersToMatch}});

				//Complete match
				match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});
				const matchedUsers = this.matchedUsers(match);
				if (matchedUsers.length > 0) {
					match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});
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
						match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

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
		} else {
			MatchMakers.insert(
				{
					_id: Random.id(5),
					modeSelection: modeSelection,
					tournamentId: tournamentId,
					usersToMatch: [userId],
					matched: []
				}
			);
		}
	}

	canUnsubscribe(userId) {
		const match = MatchMakers.findOne(
			{
				'matched.users': userId
			}
		);

		return !match;
	}

	unsubscribe(userId) {
		if (!this.canUnsubscribe(userId)) {
			return false;
		}

		const match = MatchMakers.findOne({usersToMatch: userId});

		if (match) {
			const usersToMatch = match.usersToMatch;
			usersToMatch.splice(usersToMatch.indexOf(userId), 1);
			MatchMakers.update(
				{_id: match._id},
				{$set: {usersToMatch: usersToMatch.splice(usersToMatch.indexOf(userId), 1)}}
			);
		}

		return true;
	}

	matchedUsers(match) {
		switch (match.modeSelection) {
			case '1vs1':
			case 'tournament':
				if (match.usersToMatch.length === 2) {
					return match.usersToMatch;
				}
		}

		return [];
	}
}
