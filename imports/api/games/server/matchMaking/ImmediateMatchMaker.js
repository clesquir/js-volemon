import {MatchMakers} from '/imports/api/games/matchMakers.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import UserMatch from '/imports/api/games/server/matchMaking/UserMatch.js';
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
					UserMatch.match(modeSelection, tournamentId, matchedUsers);
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
			MatchMakers.update(
				{_id: match._id},
				{$pull: {usersToMatch: userId}}
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
