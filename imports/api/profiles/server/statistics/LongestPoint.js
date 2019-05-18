import {opponentNames, teammateNames} from '/imports/api/games/games';
import {Games} from '/imports/api/games/games.js';
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

		const games = Games.find(
			query,
			{fields: {_id: 1, pointsDuration: 1, startedAt: 1, players: 1}}
		);

		let data = {};
		games.forEach((game) => {
			for (let pointDuration of game.pointsDuration) {
				if (!data.duration || pointDuration > data.duration) {
					const teammates = teammateNames(game, userId);
					const opponents = opponentNames(game, userId);

					data = {
						gameId: game._id,
						startedAt: game.startedAt,
						duration: pointDuration,
						teammateNames: teammates.length > 0 ? teammates.join(' / ') : '-',
						opponentNames: opponents.length > 0 ? opponents.join(' / ') : '-'
					};
				}
			}
		});

		return data;
	}
}
