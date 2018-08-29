import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_HALF_CIRCLE} from '/imports/api/games/shapeConstants.js';
import {GAME_STATUS_FINISHED, GAME_STATUS_FORFEITED} from '/imports/api/games/statusConstants.js';

export default class FavouriteShapes {
	static get(userId, tournamentId) {
		const players = FavouriteShapes.players(userId, tournamentId);
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

	/**
	 * @private
	 * @param userId
	 * @param tournamentId
	 */
	static players(userId, tournamentId) {
		const games = Games.find(
			{
				'players.id': userId,
				tournamentId: tournamentId,
				status: {$in: [GAME_STATUS_FINISHED, GAME_STATUS_FORFEITED]}
			}
		);
		const finishedGameIds = [];

		games.forEach((game) => {
			finishedGameIds.push(game._id);
		});

		return Players.find({userId: userId, gameId: {$in: finishedGameIds}});
	}
}
