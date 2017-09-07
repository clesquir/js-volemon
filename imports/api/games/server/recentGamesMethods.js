import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Players} from '/imports/api/games/players.js';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

Meteor.methods({
	recentGames: function(userId, skip, limit) {
		//Fetch game ids for these limited games
		const games = Games.find(
			{
				$or: [
					{hostId: userId},
					{clientId: userId}
				],
				status: GAME_STATUS_FINISHED
			},
			{
				sort: [['startedAt', 'desc']],
				fields: {
					'hostId': 1,
					'hostName': 1,
					'hostPoints': 1,
					'clientId': 1,
					'clientName': 1,
					'clientPoints': 1,
					'createdBy': 1,
					'startedAt': 1,
				},
				skip: skip,
				limit: limit
			}
		);

		const gamesById = {};
		games.forEach(function(game) {
			gamesById[game._id] = game;
		});

		const players = Players.find({gameId: {$in: Object.keys(gamesById)}});
		for (let gameId in gamesById) {
			players.forEach(function(player) {
				if (gameId === player.gameId) {
					if (gamesById[gameId].hostId === player.userId) {
						gamesById[gameId].hostShape = player.shape;
					} else if (gamesById[gameId].clientId === player.userId) {
						gamesById[gameId].clientShape = player.shape;
					}
				}
			});
		}

		const eloScores = EloScores.find({userId: userId, gameId: {$in: Object.keys(gamesById)}});
		for (let gameId in gamesById) {
			eloScores.forEach(function(eloScore) {
				if (gameId === eloScore.gameId) {
					gamesById[gameId].eloRatingChange = eloScore.eloRatingChange;
				}
			});
		}

		return Object.values(gamesById);
	}
});
