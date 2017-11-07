import {Meteor} from 'meteor/meteor';
import FavouriteShapes from '/imports/api/home/server/statistics/FavouriteShapes.js';
import LongestGame from '/imports/api/home/server/statistics/LongestGame.js';
import LongestPoint from '/imports/api/home/server/statistics/LongestPoint.js';
import TotalPlayingTime from '/imports/api/home/server/statistics/TotalPlayingTime.js';
import {EloScores} from '/imports/api/games/eloscores.js';

Meteor.methods({
	longestGame: function(userId) {
		return LongestGame.get(userId);
	},

	longestPoint: function(userId) {
		return LongestPoint.get(userId);
	},

	lowestElo: function(userId) {
		return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'asc']], limit: 1});
	},

	highestElo: function(userId) {
		return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'desc']], limit: 1});
	},

	totalPlayingTime: function(userId) {
		return TotalPlayingTime.get(userId);
	},

	favouriteShapes: function(userId) {
		return FavouriteShapes.get(userId);
	}
});
