import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TOURNAMENT_GAME_SELECTION,
	TWO_VS_TWO_GAME_MODE
} from '/imports/api/games/constants.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class EloMatchMaker extends MatchMaker {
	/**
	 * @protected
	 * @param match
	 * @returns {{id: {string}, name: {string}}[]}
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
			case ONE_VS_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', name: 'CPU'}];
			case ONE_VS_ONE_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					const matchedUsers = this.sortByEloRating(match.usersToMatch, match.tournamentId);

					//Highest is host
					return [matchedUsers[1], matchedUsers[0]];
				}
				break;
			case TWO_VS_TWO_GAME_MODE:
				if (match.usersToMatch.length === 4) {
					const matchedUsers = this.sortByEloRating(match.usersToMatch, match.tournamentId);

					//Match lowest 0 with highest 3 and both middle together
					//Highest will be the host
					return [matchedUsers[3], matchedUsers[1], matchedUsers[0], matchedUsers[2]];
				}
				break;
		}

		return [];
	}

	/**
	 * @private
	 * @param usersToMatch
	 * @param tournamentId
	 * @returns {{id: {string}, name: {string}}[]}
	 */
	sortByEloRating(usersToMatch, tournamentId) {
		const unsortedUsers = {};

		for (let user of usersToMatch) {
			const eloRating = this.getEloRating(tournamentId, user.id);

			if (unsortedUsers[eloRating] === undefined) {
				unsortedUsers[eloRating] = [];
			}
			unsortedUsers[eloRating].push(user);
		}

		const sortedUsers = [];
		Object.keys(unsortedUsers).sort((a, b) => a - b).forEach(function(key) {
			for (let user of unsortedUsers[key]) {
				sortedUsers.push(user);
			}
		});

		return sortedUsers;
	}

	/**
	 * @private
	 * @param tournamentId
	 * @param userId
	 * @returns {Number}
	 */
	getEloRating(tournamentId, userId) {
		let profile;

		if (tournamentId) {
			profile = TournamentProfiles.findOne({tournamentId: tournamentId, userId: userId});
		}

		if (!profile) {
			profile = Profiles.findOne({userId: userId});
		}

		if (profile) {
			return profile.eloRating;
		} else {
			return INITIAL_ELO_RATING;
		}
	}
}
