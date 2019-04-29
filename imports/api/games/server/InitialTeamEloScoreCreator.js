import {TeamEloScores} from '/imports/api/games/teameloscores';
import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class InitialTeamEloScoreCreator {
	static create(userId) {
		TeamEloScores.insert({
			timestamp: getUTCTimeStamp(),
			userId: userId,
			eloRating: INITIAL_ELO_RATING
		});
	}
}
