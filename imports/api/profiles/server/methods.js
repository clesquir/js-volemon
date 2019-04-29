import {EloScores} from '/imports/api/games/eloscores.js';
import {TeamEloScores} from '/imports/api/games/teameloscores';
import {Profiles} from '/imports/api/profiles/profiles.js';
import FavouriteShapes from '/imports/api/profiles/server/statistics/FavouriteShapes.js';
import LongestGame from '/imports/api/profiles/server/statistics/LongestGame.js';
import LongestPoint from '/imports/api/profiles/server/statistics/LongestPoint.js';
import NumberOfGamesPlayed from '/imports/api/profiles/server/statistics/NumberOfGamesPlayed.js';
import NumberOfShutouts from '/imports/api/profiles/server/statistics/NumberOfShutouts.js';
import TotalPlayingTime from '/imports/api/profiles/server/statistics/TotalPlayingTime.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {UserConfigurations} from '/imports/api/users/userConfigurations';
import {Meteor} from 'meteor/meteor';

Meteor.methods({
	numberOfGamesPlayed: function(userId, tournamentId) {
		return NumberOfGamesPlayed.get(userId, tournamentId);
	},

	numberOfShutouts: function(userId, tournamentId) {
		return NumberOfShutouts.get(userId, tournamentId);
	},

	longestGame: function(userId, tournamentId) {
		return LongestGame.get(userId, tournamentId);
	},

	longestPoint: function(userId, tournamentId) {
		return LongestPoint.get(userId, tournamentId);
	},

	lowestElo: function(userId, tournamentId) {
		if (tournamentId) {
			return TournamentEloScores.findOne(
				{userId: userId, tournamentId: tournamentId},
				{sort: [['eloRating', 'asc']], limit: 1}
			);
		} else {
			return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'asc']], limit: 1});
		}
	},

	highestElo: function(userId, tournamentId) {
		if (tournamentId) {
			return TournamentEloScores.findOne(
				{userId: userId, tournamentId: tournamentId},
				{sort: [['eloRating', 'desc']], limit: 1}
			);
		} else {
			return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'desc']], limit: 1});
		}
	},

	lowestTeamElo: function(userId) {
		return TeamEloScores.findOne({userId: userId}, {sort: [['eloRating', 'asc']], limit: 1});
	},

	highestTeamElo: function(userId) {
		return TeamEloScores.findOne({userId: userId}, {sort: [['eloRating', 'desc']], limit: 1});
	},

	currentElo: function(userId, tournamentId) {
		if (tournamentId) {
			return TournamentProfiles.findOne({userId: userId, tournamentId: tournamentId});
		} else {
			return Profiles.findOne({userId: userId});
		}
	},

	totalPlayingTime: function(userId, tournamentId) {
		return TotalPlayingTime.get(userId, tournamentId);
	},

	favouriteShapes: function(userId, tournamentId) {
		return FavouriteShapes.get(userId, tournamentId);
	},

	userRanksChart: function(eloMode, minDate, users) {
		const usernameByUserId = {};

		UserConfigurations.find({userId: {'$in': users}}).forEach((userConfiguration) => {
			usernameByUserId[userConfiguration.userId] = userConfiguration.name;
		});

		let eloScores;
		if (eloMode === 'solo') {
			eloScores = EloScores;
		} else {
			eloScores = TeamEloScores;
		}

		const ranksChartData = [];
		eloScores.find({timestamp: {$gt: minDate}, userId: {'$in': users}}).forEach((eloScore) => {
			ranksChartData.push(
				Object.assign(
					eloScore,
					{
						username: usernameByUserId[eloScore.userId]
					}
				)
			);
		});

		return ranksChartData;
	},

	userProfileRanksChart: function(eloMode, minDate, users, tournamentId) {
		const usernameByUserId = {};

		UserConfigurations.find({userId: {'$in': users}}).forEach((userConfiguration) => {
			usernameByUserId[userConfiguration.userId] = userConfiguration.name;
		});

		let eloScores;
		if (tournamentId) {
			eloScores = TournamentEloScores.find({timestamp: {$gt: minDate}, userId: {'$in': users}, tournamentId: tournamentId});
		} else {
			if (eloMode === 'solo') {
				eloScores = EloScores;
			} else {
				eloScores = TeamEloScores;
			}
			eloScores = eloScores.find({timestamp: {$gt: minDate}, userId: {'$in': users}});
		}

		const ranksChartData = [];
		eloScores.forEach((eloScore) => {
			ranksChartData.push(
				Object.assign(
					eloScore,
					{
						username: usernameByUserId[eloScore.userId]
					}
				)
			);
		});

		return ranksChartData;
	},

	tournamentRanksChart: function(tournamentId) {
		const usernameByUserId = {};

		UserConfigurations.find().forEach((userConfiguration) => {
			usernameByUserId[userConfiguration.userId] = userConfiguration.name;
		});

		const ranksChartData = [];
		TournamentEloScores.find({tournamentId: tournamentId}).forEach((eloScore) => {
			ranksChartData.push(
				Object.assign(
					eloScore,
					{
						username: usernameByUserId[eloScore.userId]
					}
				)
			);
		});

		return ranksChartData;
	}
});
