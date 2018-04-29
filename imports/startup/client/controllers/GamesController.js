import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_STARTED} from '/imports/api/games/statusConstants.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {Meteor} from 'meteor/meteor';

export const GamesController = RouteController.extend({
	waitOn: function() {
		return [
			Meteor.subscribe('games')
		];
	},
	data: function() {
		return {
			games: Games.find({status: GAME_STATUS_STARTED}, {sort: [['createdAt', 'desc']]}),
			tournaments: Tournaments.find()
		};
	}
});
