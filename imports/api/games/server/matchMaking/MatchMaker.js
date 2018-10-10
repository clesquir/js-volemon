import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import UserMatch from '/imports/api/games/server/matchMaking/UserMatch.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class MatchMaker {
	subscribe(user, modeSelection, tournamentId) {
		let match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match) {
			if (!this.userPresentInArray(match.usersToMatch, user.id)) {
				this.addToUserToMatch(user, modeSelection, tournamentId);
			}
		} else {
			this.initMatchMaker(user, modeSelection, tournamentId);
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

			//Remove all computers left alone
			let hasHumans = false;
			let hasCpu = false;
			for (let userToMatch of match.usersToMatch) {
				if (userToMatch.id !== userId) {
					if (userToMatch.id === 'CPU') {
						hasCpu = true;
					} else {
						hasHumans = true;
					}
				}
			}

			if (!hasHumans && hasCpu) {
				MatchMakers.update(
					{_id: match._id},
					{$pull: {usersToMatch: {id: 'CPU'}}}
				);
			}
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
			if (user.id === userId && userId !== 'CPU') {
				return true;
			}
		}

		return false;
	}

	initMatchMaker(user, modeSelection, tournamentId) {
		MatchMakers.insert(
			{
				_id: Random.id(5),
				modeSelection: modeSelection,
				tournamentId: tournamentId,
				usersToMatch: [user],
				matched: []
			}
		);
	}

	/**
	 * @protected
	 * @param user
	 * @param modeSelection
	 * @param tournamentId
	 */
	addToUserToMatch(user, modeSelection, tournamentId) {
		//Add to the usersToMatch
		MatchMakers.update(
			{modeSelection: modeSelection, tournamentId: tournamentId},
			{$push: {usersToMatch: user}}
		);
	}

	/**
	 * @protected
	 */
	matchedUsers(match) {
		throw 'Abstract';
	}
}
