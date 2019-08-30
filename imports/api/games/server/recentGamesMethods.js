import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {Meteor} from 'meteor/meteor';

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
					'_id': 1,
					'gameMode': 1,
					'players': 1,
					'hostPoints': 1,
					'clientPoints': 1,
					'createdBy': 1,
					'startedAt': 1,
					'tournamentId': 1,
					'hasReplays': 1,
				},
				skip: skip,
				limit: limit
			}
		);

		const gamesById = {};
		games.forEach(function(game) {
			gamesById[game._id] = game;
		});

		let eloScores = [];
		let teamEloScores = [];
		let tournamentEloScores = [];
		if (tournamentId) {
			tournamentEloScores = TournamentEloScores.find(
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
			teamEloScores = TeamEloScores.find(
				{
					userId: userId,
					gameId: {$in: Object.keys(gamesById)}
				}
			);
		}

		for (let gameId in gamesById) {
			if (gamesById.hasOwnProperty(gameId)) {
				if (tournamentId) {
					tournamentEloScores.forEach(function(eloScore) {
						if (gameId === eloScore.gameId) {
							gamesById[gameId].eloRatingChange = eloScore.eloRatingChange;
						}
					});
				} else {
					eloScores.forEach(function(eloScore) {
						if (gameId === eloScore.gameId) {
							gamesById[gameId].eloRatingChange = eloScore.eloRatingChange;
						}
					});
					teamEloScores.forEach(function(eloScore) {
						if (gameId === eloScore.gameId) {
							gamesById[gameId].eloRatingChange = eloScore.eloRatingChange;
						}
					});
				}
			}
		}

		return Object.values(gamesById);
	}
});
