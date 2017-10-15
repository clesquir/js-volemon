import {Meteor} from 'meteor/meteor';
import {Games} from '/imports/api/games/games.js';

export const GamesController = RouteController.extend({
	waitOn: function() {
		return Meteor.subscribe('games');
	},
	data: function() {
		return {
			games: Games.find({}, {sort: [['createdAt', 'desc']]})
		};
	}
});
