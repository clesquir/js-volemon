export const INITIAL_ELO_RATING = 1000;
export const DEFAULT_PROFILE_DATA = {
	numberOfWin: 0,
	numberOfLost: 0,
	numberOfShutouts: 0,
	numberOfShutoutLosses: 0,

	eloRating: INITIAL_ELO_RATING,
	eloRatingLastChange: 0,
	soloNumberOfWin: 0,
	soloNumberOfLost: 0,
	soloNumberOfShutouts: 0,
	soloNumberOfShutoutLosses: 0,

	teamEloRating: INITIAL_ELO_RATING,
	teamEloRatingLastChange: 0,
	teamNumberOfWin: 0,
	teamNumberOfLost: 0,
	teamNumberOfShutouts: 0,
	teamNumberOfShutoutLosses: 0,
};

export const DEFAULT_TOURNAMENT_PROFILE_DATA = {
	numberOfWin: 0,
	numberOfLost: 0,
	numberOfShutouts: 0,
	numberOfShutoutLosses: 0,
	eloRating: INITIAL_ELO_RATING,
	eloRatingLastChange: 0,
};
