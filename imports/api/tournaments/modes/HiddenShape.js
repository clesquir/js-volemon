import {
	PLAYER_SHAPE_RANDOM,
	PLAYER_SHAPE_HALF_CIRCLE,
	PLAYER_SHAPE_TRIANGLE,
	PLAYER_SHAPE_X,
	PLAYER_SHAPE_RECTANGLE,
	PLAYER_SHAPE_EQUAL,
	PLAYER_SHAPE_MAGNET,
	PLAYER_SHAPE_CROWN,
	PLAYER_SHAPE_RHOMBUS,
	PLAYER_SHAPE_HEXAGON,
	PLAYER_SHAPE_ELLIPSE,
	PLAYER_SHAPE_TRIPLE_COLON
} from '/imports/api/games/shapeConstants.js';
import Classic from './Classic';

export default class HiddenShape extends Classic {
	overridesListOfShapes() {
		return true;
	}

	listOfShapes() {
		return [
			PLAYER_SHAPE_HALF_CIRCLE,
			PLAYER_SHAPE_TRIANGLE,
			PLAYER_SHAPE_X,
			PLAYER_SHAPE_RECTANGLE,
			PLAYER_SHAPE_EQUAL,
			PLAYER_SHAPE_MAGNET,
			PLAYER_SHAPE_CROWN,
			PLAYER_SHAPE_RHOMBUS,
			PLAYER_SHAPE_HEXAGON,
			PLAYER_SHAPE_ELLIPSE,
			PLAYER_SHAPE_TRIPLE_COLON
		];
	}

	overridesAllowedListOfShapes() {
		return true;
	}

	allowedListOfShapes() {
		return [PLAYER_SHAPE_RANDOM];
	}

	overridesCurrentPlayerShape() {
		return true;
	}

	currentPlayerShape() {
		return 'hidden';
	}
}
