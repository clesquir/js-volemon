import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {longestGame, longestPoint, favouriteShapes} from '/imports/api/home/utils.js';

Meteor.methods({
	longestGame: function(userId) {
		return longestGame(userId);
	},

	longestPoint: function(userId) {
		return longestPoint(userId);
	},

	lowestElo: function(userId) {
		return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'asc']], limit: 1});
	},

	highestElo: function(userId) {
		return EloScores.findOne({userId: userId}, {sort: [['eloRating', 'desc']], limit: 1});
	},

	favouriteShapes: function(userId) {
		return favouriteShapes(userId);
	}
});
