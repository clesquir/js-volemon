import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Players} from '/imports/api/games/players.js';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';

Meteor.methods({
	recentGames: function(userId, tournamentId, skip, limit) {
		//Fetch game ids for these limited games
		const gameQuery = {
			'players.id': userId,
			status: GAME_STATUS_FINISHED
		};

		if (tournamentId) {
			gameQuery.tournamentId = tournamentId;
		}

		const games = Games.find(
			gameQuery,
			{
				sort: [['startedAt', 'desc']],
				fields: {
					'gameMode': 1,
					'players': 1,
					'hostPoints': 1,
					'clientPoints': 1,
					'createdBy': 1,
					'startedAt': 1,
					'tournamentId': 1,
				},
				skip: skip,
				limit: limit
			}
		);

		const gamesById = {};
		games.forEach(function(game) {
			gamesById[game._id] = game;
			gamesById[game._id].shapes = [];
		});

		const players = Players.find({gameId: {$in: Object.keys(gamesById)}});
		for (let gameId in gamesById) {
			if (gamesById.hasOwnProperty(gameId)) {
				players.forEach(function(player) {
					if (gameId === player.gameId) {
						if (gamesById[gameId].players[0].id === player.userId) {
							gamesById[gameId].shapes[0] = player.shape;
						} else if (gamesById[gameId].players[1].id === player.userId) {
							gamesById[gameId].shapes[1] = player.shape;
						} else if (gamesById[gameId].players[2].id === player.userId) {
							gamesById[gameId].shapes[2] = player.shape;
						} else if (gamesById[gameId].players[3].id === player.userId) {
							gamesById[gameId].shapes[3] = player.shape;
						}
					}
				});
			}
		}

		let eloScores = [];
		if (tournamentId) {
			eloScores = TournamentEloScores.find(
				{
					userId: userId,
					tournamentId: tournamentId,
					gameId: {$in: Object.keys(gamesById)}
				}
			);
		} else {
			eloScores = EloScores.find(
				{
					userId: userId,
					gameId: {$in: Object.keys(gamesById)}
				}
			);
		}
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
