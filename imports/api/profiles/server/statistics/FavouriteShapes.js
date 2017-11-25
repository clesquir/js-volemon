import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {PLAYER_SHAPE_HALF_CIRCLE} from '/imports/api/games/shapeConstants.js';

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
		let players = Players.find({userId: userId});

		if (tournamentId) {
			const playerGameIds = [];

			players.forEach((player) => {
				playerGameIds.push(player.gameId);
			});

			const games = Games.find({_id: {$in: playerGameIds}, tournamentId: tournamentId});
			const tournamentGameIds = [];

			games.forEach((game) => {
				tournamentGameIds.push(game._id);
			});

			players = Players.find({userId: userId, gameId: {$in: tournamentGameIds}});
		}

		return players;
	}
}
