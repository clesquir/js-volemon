import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Achievements} from '/imports/api/achievements/achievements.js';
import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {Profiles} from '/imports/api/profiles/profiles.js';

const GAMES_INCREMENT_ON_HOMEPAGE = 5;
const GAMES_LIMIT_ON_HOMEPAGE = 5;

export const HomeController = RouteController.extend({
	subscriptions: function() {
		return [];
	},
	onBeforeAction: function() {
		this.state.setDefault('gamesLimit', GAMES_LIMIT_ON_HOMEPAGE);
		this.next();
	},
	gamesIncrement: function() {
		return GAMES_INCREMENT_ON_HOMEPAGE;
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
