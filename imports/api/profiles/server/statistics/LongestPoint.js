import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

export default class LongestPoint {
	static get(userId, tournamentId) {
		const query = {
			'players.id': userId,
			status: GAME_STATUS_FINISHED,
			pointsDuration: {$exists: true}
		};

		if (tournamentId) {
			query.tournamentId = tournamentId;
		}

		const games = Games.find(query);

		let data = {};
		games.forEach((game) => {
			for (let pointDuration of game.pointsDuration) {
				if (!data.duration || pointDuration > data.duration) {
					data = {
						gameId: game._id,
						startedAt: game.startedAt,
						duration: pointDuration
					};
				}
			}
		});

		if (data.gameId) {
			const player = Players.findOne({userId: {$ne: userId}, gameId: data.gameId});
			data.playerName = player ? player.name : '-';
		}

		return data;
	}
}
