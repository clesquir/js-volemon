import {isTwoVersusTwoGameMode} from '/imports/api/games/constants';
import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TOURNAMENT_GAME_SELECTION,
	TWO_VS_TWO_GAME_MODE,
	TWO_VS_TWO_HUMAN_CPU_GAME_MODE
} from '/imports/api/games/constants.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

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
			case ONE_VS_MACHINE_LEARNING_COMPUTER_GAME_MODE:
				return [match.usersToMatch[0], {id: 'CPU', isMachineLearning: true, name: 'ML CPU'}];
			case ONE_VS_ONE_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					const matchedUsers = this.sortByEloRating(
						gameMode,
						match.usersToMatch,
						match.tournamentId
					);

					//Highest is host
					return [matchedUsers[1], matchedUsers[0]];
				}
				break;
			case TWO_VS_TWO_GAME_MODE:
				if (match.usersToMatch.length === 4) {
					let matchedUsers = [];

					if (this.numberOfMatchedComputers(match.usersToMatch) === 2) {
						const matchedComputers = this.getMatchedComputers(match.usersToMatch);
						const matchedHumans = this.sortByEloRating(
							gameMode,
							this.getMatchedHumans(match.usersToMatch),
							match.tournamentId
						);

						matchedUsers = [
							matchedComputers[0],
							matchedHumans[0],
							matchedComputers[1],
							matchedHumans[1],
						];
					} else {
						matchedUsers = this.sortByEloRating(
							gameMode,
							match.usersToMatch,
							match.tournamentId
						);
					}

					//Match highest 3 with lowest 0 and both middle together
					//Highest will be the host
					return [matchedUsers[3], matchedUsers[1], matchedUsers[0], matchedUsers[2]];
				}
				break;
			case TWO_VS_TWO_HUMAN_CPU_GAME_MODE:
				if (match.usersToMatch.length === 2) {
					const matchedUsers = this.sortByEloRating(
						gameMode,
						match.usersToMatch,
						match.tournamentId
					);

					return [
						matchedUsers[1],
						matchedUsers[0],
						{id: 'CPU', isMachineLearning: true, name: 'ML CPU'},
						{id: 'CPU', isMachineLearning: true, name: 'ML CPU'}
					];
				}
		}

		return [];
	}

	/**
	 * @private
	 * @param gameMode
	 * @param usersToMatch
	 * @param tournamentId
	 * @returns {{id: {string}, name: {string}}[]}
	 */
	sortByEloRating(gameMode, usersToMatch, tournamentId) {
		const randomize = arr => arr
			.map(a => [Math.random(), a])
			.sort((a, b) => a[0] - b[0])
			.map(a => a[1]);

		const randomizedUsers = randomize(usersToMatch);
		const unsortedUsers = {};
		for (let user of randomizedUsers) {
			const eloRating = this.getEloRating(gameMode, tournamentId, user.id);

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
	 * @param gameMode
	 * @param tournamentId
	 * @param userId
	 * @returns {Number}
	 */
	getEloRating(gameMode, tournamentId, userId) {
		let profile = Profiles.findOne({userId: userId});

		if (profile) {
			if (isTwoVersusTwoGameMode(gameMode)) {
				return profile.teamEloRating || INITIAL_ELO_RATING;
			} else {
				return profile.eloRating || INITIAL_ELO_RATING;
			}
		} else {
			return INITIAL_ELO_RATING;
		}
	}

	/**
	 * @private
	 * @param usersToMatch
	 * @returns {number}
	 */
	numberOfMatchedComputers(usersToMatch) {
		let count = 0;

		for (let user of usersToMatch) {
			if (user.id === 'CPU') {
				count++;
			}
		}

		return count;
	}

	/**
	 * @private
	 * @param usersToMatch
	 * @returns {Array}
	 */
	getMatchedComputers(usersToMatch) {
		let computers = [];

		for (let user of usersToMatch) {
			if (user.id === 'CPU') {
				computers.push(user);
			}
		}

		return computers;
	}

	/**
	 * @private
	 * @param usersToMatch
	 * @returns {Array}
	 */
	getMatchedHumans(usersToMatch) {
		let humans = [];

		for (let user of usersToMatch) {
			if (user.id !== 'CPU') {
				humans.push(user);
			}
		}

		return humans;
	}
}
