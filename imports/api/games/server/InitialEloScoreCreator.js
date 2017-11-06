import {EloScores} from '/imports/api/games/eloscores.js';
import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class InitialEloScoreCreator {
	static create(userId) {
		EloScores.insert({
			timestamp: getUTCTimeStamp(),
			userId: userId,
			eloRating: INITIAL_ELO_RATING
		});
	}
}
