import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';

export const GamesController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('games');
	},
	data: function() {
		return {
			games: Games.find({}, {sort: [['createdAt', 'desc']]}),
			tournaments: Tournaments.find()
		};
	}
});
