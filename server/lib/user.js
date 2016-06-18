createProfile = function(user) {
	var profile = {
		userId: user._id,
		retiredAt: null,
		numberOfWin: 0,
		numberOfLost: 0,
		eloRating: 1000,
		eloRatingLastChange: 0
	};

	Profiles.insert(profile);

	EloScores.insert({
		timestamp: getUTCTimeStamp(),
		userId: user._id,
		eloRating: profile['eloRating']
	});
};
