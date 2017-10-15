import {EloScores} from '/imports/api/games/eloscores.js';
import {INITIAL_ELO_RATING, DEFAULT_PROFILE_DATA} from '/imports/api/profiles/constants.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export const createProfile = function(userId) {
	Profiles.insert(
		Object.assign(
			{
				userId: userId
			},
			DEFAULT_PROFILE_DATA
		)
	);

	EloScores.insert({
		timestamp: getUTCTimeStamp(),
		userId: userId,
		eloRating: INITIAL_ELO_RATING
	});
};
