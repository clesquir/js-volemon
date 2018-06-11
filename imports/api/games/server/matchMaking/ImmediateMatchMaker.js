import {
	ONE_VS_COMPUTER_GAME_MODE,
	ONE_VS_ONE_GAME_MODE,
	TOURNAMENT_GAME_SELECTION,
	TWO_VS_TWO_GAME_MODE
} from '/imports/api/games/constants.js';
import {MatchMakers} from '/imports/api/games/matchMakers.js';
import MatchMaker from '/imports/api/games/server/matchMaking/MatchMaker.js';
import UserMatch from '/imports/api/games/server/matchMaking/UserMatch.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from "meteor/meteor";
import {Random} from 'meteor/random';

export default class ImmediateMatchMaker extends MatchMaker {
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
			case ONE_VS_COMPUTER_GAME_MODE:
				return match.usersToMatch;
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
