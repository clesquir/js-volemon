import {EloScores} from '/imports/api/games/eloscores.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Constants} from '/imports/lib/constants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export const createProfile = function(user) {
	const profile = {
		userId: user._id,
		retiredAt: null,
		numberOfWin: 0,
		numberOfLost: 0,
		numberOfShutouts: 0,
		eloRating: 1000,
		eloRatingLastChange: 0,
		lastShapeUsed: Constants.PLAYER_DEFAULT_SHAPE
	};

	Profiles.insert(profile);

	EloScores.insert({
		timestamp: getUTCTimeStamp(),
		userId: user._id,
		eloRating: profile['eloRating']
	});
};
