import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {Config} from '/imports/lib/config.js';

export const HomeController = RouteController.extend({
	subscriptions: function() {
		return [];
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

		if (this.ready()) {
			this.render();
		} else {
			this.next();
		}
	},
	data: function() {
		return {
			achievements: Achievements.find(),
			userAchievements: UserAchievements.find({userId: Meteor.userId()}),
			profile: Profiles.findOne({userId: Meteor.userId()}),
			games: Games.find({}, {sort: [['startedAt', 'desc']]}),
			players: Players.find(),
			eloScores: EloScores.find({userId: Meteor.userId()})
		};
	}
});
