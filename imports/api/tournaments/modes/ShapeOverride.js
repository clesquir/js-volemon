import {
	PLAYER_SHAPE_OBELISK,
	PLAYER_SHAPE_RANDOM,
	PLAYER_SHAPE_TRIPLE_COLON
} from '/imports/api/games/shapeConstants.js';
import Classic from './Classic';

export default class ShapeOverride extends Classic {
	overridesListOfShapes() {
		return true;
	}

	listOfShapes() {
		return [
			PLAYER_SHAPE_TRIPLE_COLON,
			PLAYER_SHAPE_OBELISK
		];
	}

	overridesAllowedListOfShapes() {
		return true;
	}

	allowedListOfShapes() {
		return [
			PLAYER_SHAPE_RANDOM,
			PLAYER_SHAPE_TRIPLE_COLON,
			PLAYER_SHAPE_OBELISK
		];
	}
}
