import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

export default class LongestGame {
	static get(userId) {
		const players = Players.find({userId: userId});
		const gamesIds = [];

		players.forEach((player) => {
			gamesIds.push(player.gameId);
		});

		const games = Games.find(
			{_id: {$in: gamesIds}, status: GAME_STATUS_FINISHED, gameDuration: {$exists: true}},
			{sort: [['gameDuration', 'desc']], limit: 1}
		);

		let data = {};
		games.forEach((game) => {
			const player = Players.findOne({userId: {$ne: userId}, gameId: game._id});

			data = {
				gameId: game._id,
				startedAt: game.startedAt,
				duration: game.gameDuration,
				playerName: player ? player.name : '-'
			};
		});

		return data;
	}
}
