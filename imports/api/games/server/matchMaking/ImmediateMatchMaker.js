import {ONE_VS_ONE_GAME_MODE, TOURNAMENT_GAME_SELECTION, TWO_VS_TWO_GAME_MODE} from '/imports/api/games/constants.js';
import {Games} from '/imports/api/games/games.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import UserMatch from '/imports/api/games/server/matchMaking/UserMatch.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class ImmediateMatchMaker extends MatchMaker {
	subscribe(userId, userName, modeSelection, tournamentId) {
		let match = MatchMakers.findOne({modeSelection: modeSelection, tournamentId: tournamentId});

		if (match) {
			if (!this.userPresentInArray(match.usersToMatch, userId)) {
				//Add to the usersToMatch
				MatchMakers.update(
					{_id: match._id},
					{$push: {usersToMatch: {id: userId, name: userName}}}
				);

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
					usersToMatch: [{id: userId, name: userName}],
					matched: []
				}
			);
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
	 * @private
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

	/**
	 * @private
	 * @param match
	 * @returns {Array}
	 */
	matchedUsers(match) {
		let gameMode = match.modeSelection;
		if (match.modeSelection === TOURNAMENT_GAME_SELECTION) {
			const tournament = Tournaments.findOne(match.tournamentId);

			if (tournament && tournament.gameMode) {
				gameMode = tournament.gameMode;
			} else {
				gameMode = ONE_VS_ONE_GAME_MODE;
			}
		}

		switch (gameMode) {
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
