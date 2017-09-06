import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

export const longestGame = function(userId) {
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
};

export const longestPoint = function(userId) {
	const players = Players.find({userId: userId});
	const gamesIds = [];

	players.forEach((player) => {
		gamesIds.push(player.gameId);
	});

	const games = Games.find({_id: {$in: gamesIds}, status: GAME_STATUS_FINISHED, pointsDuration: {$exists: true}});

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
};

export const favouriteShape = function(userId) {
	const players = Players.find({userId: userId});
	const shapes = {};
	const data = {};

	players.forEach((player) => {
		if (player.selectedShape !== undefined) {
			if (!shapes.hasOwnProperty(player.selectedShape)) {
				shapes[player.selectedShape] = 0;
			}
			shapes[player.selectedShape]++;
		}
	});

	const shapeKeys = Object.keys(shapes).sort(
		function(a, b) {
			return shapes[b] - shapes[a];
		}
	);

	if (shapeKeys.length) {
		data.shape = shapeKeys[0];
	}

	return data;
};
