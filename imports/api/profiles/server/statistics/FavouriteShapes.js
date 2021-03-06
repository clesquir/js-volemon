import {Games} from '/imports/api/games/games.js';
import {PLAYER_SHAPE_HALF_CIRCLE} from '/imports/api/games/shapeConstants.js';
import {GAME_STATUS_FINISHED, GAME_STATUS_FORFEITED} from '/imports/api/games/statusConstants.js';

export default class FavouriteShapes {
	static get(userId, tournamentId) {
		const players = FavouriteShapes.players(userId, tournamentId);
		const shapes = {};

		for (let player of players) {
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
		}

		return shapes;
	}

	/**
	 * @private
	 * @param userId
	 * @param tournamentId
	 */
	static players(userId, tournamentId) {
		const query = {
			'players.id': userId,
			status: {$in: [GAME_STATUS_FINISHED, GAME_STATUS_FORFEITED]}
		};

		if (tournamentId) {
			query.tournamentId = tournamentId;
		}

		const games = Games.find(
			query,
			{
				fields: {'players.id': 1, 'players.shape': 1, 'players.selectedShape': 1}
			}
		);
		const players = [];

		games.forEach((game) => {
			for (let player of game.players) {
				if (player.id === userId) {
					players.push(
						{
							shape: player.shape,
							selectedShape: player.selectedShape,
						}
					);
					break;
				}
			}
		});

		return players;
	}
}
