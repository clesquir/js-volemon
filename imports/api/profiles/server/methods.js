import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import FavouriteShapes from '/imports/api/profiles/server/statistics/FavouriteShapes.js';
import LongestGame from '/imports/api/profiles/server/statistics/LongestGame.js';
import LongestPoint from '/imports/api/profiles/server/statistics/LongestPoint.js';
import NumberOfGamesPlayed from '/imports/api/profiles/server/statistics/NumberOfGamesPlayed.js';
import NumberOfShutouts from '/imports/api/profiles/server/statistics/NumberOfShutouts.js';
import TotalPlayingTime from '/imports/api/profiles/server/statistics/TotalPlayingTime.js';
import {TournamentEloScores} from '/imports/api/tournaments/tournamentEloScores.js';
import {TournamentProfiles} from '/imports/api/tournaments/tournamentProfiles.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

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
	}
});
