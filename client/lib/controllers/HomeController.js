import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Profiles } from '/collections/profiles.js';
import { Config } from '/imports/lib/config.js';

HomeController = RouteController.extend({
	subscriptions: function() {
		return Meteor.subscribe('profileData');
	},
	onBeforeAction: function() {
		this.state.setDefault('gamesLimit', Config.gamesLimitOnHomePage);
		this.next();
	},
	gamesIncrement: function() {
		return Config.gamesIncrementOnHomePage;
	},
	gamesLimit: function () {
		return this.state.get('gamesLimit') || this.gamesIncrement();
	},
	gamesCount: function() {
		return Games.find({}, {sort: [['startedAt', 'desc']]}).count();
	},
	action: function () {
		Meteor.subscribe('recentProfileGames', this.gamesLimit());
		Meteor.call('longestGame', function(error, data) {
			if (!error && data.gameId) {
				Session.set('longestGame', data);
			}
		});
		Meteor.call('longestPoint', function(error, data) {
			if (!error && data.gameId) {
				Session.set('longestPoint', data);
			}
		});

		if (this.ready()) {
			this.render();
		} else {
			this.next();
		}
	},
	data: function() {
		return {
			profile: Profiles.findOne({userId: Meteor.userId()}),
			games: Games.find({}, {sort: [['startedAt', 'desc']]}),
			players: Players.find()
		};
	}
});
