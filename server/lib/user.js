import { EloScores } from '/collections/eloscores.js';
import { Profiles } from '/collections/profiles.js';
import { Constants } from '/lib/constants.js';
import { getUTCTimeStamp } from '/lib/utils.js';

createProfile = function(user) {
	var profile = {
		userId: user._id,
		retiredAt: null,
		numberOfWin: 0,
		numberOfLost: 0,
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
