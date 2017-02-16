import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/imports/lib/constants.js';

Meteor.methods({
	longestGame: function() {
		check(this.userId, String);

		let players = Players.find({userId: this.userId});
		let gamesIds = [];

		players.forEach((player) => {
			gamesIds.push(player.gameId);
		});

		let games = Games.find(
			{_id: {$in: gamesIds}, status: Constants.GAME_STATUS_FINISHED, gameDuration: {$exists: true}},
			{sort: [['gameDuration', 'desc']], limit: 1}
		);

		let data = {};
		games.forEach((game) => {
			let player = Players.findOne({userId: {$ne: this.userId}, gameId: game._id});

			data = {
				gameId: game._id,
				startedAt: game.startedAt,
				duration: game.gameDuration,
				playerName: player ? player.name : '-'
			};
		});

		return data;
	},

	longestPoint: function() {
		check(this.userId, String);

		let players = Players.find({userId: this.userId});
		let gamesIds = [];

		players.forEach((player) => {
			gamesIds.push(player.gameId);
		});

		let games = Games.find({_id: {$in: gamesIds}, status: Constants.GAME_STATUS_FINISHED, pointsDuration: {$exists: true}});

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
			let player = Players.findOne({userId: {$ne: this.userId}, gameId: data.gameId});
			data.playerName = player ? player.name : '-';
		}

		return data;
	}
});
