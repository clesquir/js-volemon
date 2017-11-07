import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_HALF_CIRCLE} from '/imports/api/games/shapeConstants.js';

export default class FavouriteShapes {
	static get(userId) {
		const players = Players.find({userId: userId});
		const shapes = {};

		players.forEach((player) => {
			//Before selectedShape was implemented
			let shape = player.shape;

			if (player.selectedShape !== undefined) {
				shape = player.selectedShape;
			}

			//Before different shapes were implemented
			if (shape === undefined) {
				shape = PLAYER_SHAPE_HALF_CIRCLE;
			}

			if (!shapes.hasOwnProperty(shape)) {
				shapes[shape] = 0;
			}
			shapes[shape]++;
		});

		return shapes;
	}
}
