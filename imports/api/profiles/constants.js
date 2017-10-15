import {PLAYER_DEFAULT_SHAPE} from '/imports/api/games/shapeConstants.js';

export const INITIAL_ELO_RATING = 1000;
export const DEFAULT_PROFILE_DATA = {
	numberOfWin: 0,
	numberOfLost: 0,
	numberOfShutouts: 0,
	numberOfShutoutLosses: 0,
	eloRating: INITIAL_ELO_RATING,
	eloRatingLastChange: 0,
	lastShapeUsed: PLAYER_DEFAULT_SHAPE
};
