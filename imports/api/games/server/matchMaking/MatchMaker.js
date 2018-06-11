import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import UserMatch from 'imports/api/games/server/matchMaking/UserMatch';

export default class MatchMaker {
	subscribe(userId, userName, modeSelection, tournamentId) {
		let match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match) {
			if (!this.userPresentInArray(match.usersToMatch, userId)) {
				this.addToUserToMatch(userId, userName, modeSelection, tournamentId);
			}
		} else {
			this.initMatchMaker(userId, userName, modeSelection, tournamentId);
		}

		//Complete match
		match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});
		const matchedUsers = this.matchedUsers(match);
		if (matchedUsers.length > 0) {
			UserMatch.match(modeSelection, tournamentId, matchedUsers);
		}
	}

	canUnsubscribe(userId) {
		const match = MatchMakers.findOne({'matched.users.id': userId});

		if (match) {
			for (let matched of match.matched) {
				if (this.userPresentInArray(matched.users, userId)) {
					const game = Games.findOne(matched.gameId);

					if (game) {
						return !game.isReady;
					}
				}
			}
		}

		return true;
	}

	unsubscribe(userId) {
		if (!this.canUnsubscribe(userId)) {
			return false;
		}

		let match = MatchMakers.findOne({'usersToMatch.id': userId});
		if (match) {
			MatchMakers.update(
				{_id: match._id},
				{$pull: {usersToMatch: {id: userId}}}
			);
		}

		match = MatchMakers.findOne({'matched.users.id': userId});
		if (match) {
			MatchMakers.update(
				{_id: match._id},
				{$pull: {matched: {'users.id': userId}}}
			);
		}

		return true;
	}

	/**
	 * @protected
	 * @param users
	 * @param userId
	 * @returns {boolean}
	 */
	userPresentInArray(users, userId) {
		for (let user of users) {
			if (user.id === userId) {
				return true;
			}
		}

		return false;
	}

	initMatchMaker(userId, userName, modeSelection, tournamentId) {
		MatchMakers.insert(
			{
				_id: Random.id(5),
				modeSelection: modeSelection,
				tournamentId: tournamentId,
				usersToMatch: [{id: userId, name: userName}],
				matched: []
			}
		);
	}

	/**
	 * @protected
	 * @param userId
	 * @param userName
	 * @param modeSelection
	 * @param tournamentId
	 */
	addToUserToMatch(userId, userName, modeSelection, tournamentId) {
		//Add to the usersToMatch
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$push: {usersToMatch: {id: userId, name: userName}}}
		);
	}
}
