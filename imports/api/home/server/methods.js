import {Meteor} from 'meteor/meteor';
import {EloScores} from '/imports/api/games/eloscores.js';
import {longestGame, longestPoint} from '/imports/api/home/lib/utils.js';

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
	}
});
