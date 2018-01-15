import {
	PLAYER_SHAPE_RANDOM,
	PLAYER_SHAPE_HYPHEN,
	PLAYER_SHAPE_OBELISK
} from '/imports/api/games/shapeConstants.js';
import Classic from './Classic';

export default class SpaghettiOnTheCarpet extends Classic {
	overridesListOfShapes() {
		return true;
	}

	listOfShapes() {
		return [
			PLAYER_SHAPE_HYPHEN,
			PLAYER_SHAPE_OBELISK
		];
	}

	overridesAllowedListOfShapes() {
		return true;
	}

	allowedListOfShapes() {
		return [
			PLAYER_SHAPE_RANDOM,
			PLAYER_SHAPE_HYPHEN,
			PLAYER_SHAPE_OBELISK
		];
	}
}
