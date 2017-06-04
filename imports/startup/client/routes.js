import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';
import {EloScores} from '/imports/api/games/eloscores.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {updateConnectionIndicator, destroyConnectionIndicator} from '/imports/api/games/client/connectionIndicator.js';
import {initGame, quitGame, destroyGame, unsetGameSessions} from '/imports/api/games/client/routeInitiator.js';
import {Profiles} from '/imports/api/profiles/profiles.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';

import '/imports/ui/pages/app.js';
import '/imports/ui/pages/game.js';
import '/imports/ui/pages/gamesList.js';
import '/imports/ui/pages/home.js';
import '/imports/ui/pages/login.js';
import '/imports/ui/pages/passwordChange.js';
import '/imports/ui/pages/rank.js';
import '/imports/ui/pages/testEnvironment.js';
import '/imports/ui/pages/username.js';

import '/imports/ui/components/achievementPopup.js';
import '/imports/ui/components/achievements.js';
import '/imports/ui/components/eloRatingChange.js';
import '/imports/ui/components/lightbox.js';
import '/imports/ui/components/loading.js';
import '/imports/ui/components/reactions.js';
import '/imports/ui/components/recentGames.js';
import '/imports/ui/components/shapeSelector.js';
import '/imports/ui/components/statistics.js';
import '/imports/ui/components/switchButton.js';

Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [
			Meteor.subscribe('userData'),
			Meteor.subscribe('achievements'),
			Meteor.subscribe('userAchievements', Meteor.userId())
		];
	}
});

Router.map(function() {
	this.route('home', {
		path: '/',
		controller: HomeController
	});

	//This is use for various game environment tests
	if (Meteor.isDevelopment) {
		this.route('test-environment', {
			path: '/test-environment'
		});
	}

	this.route('games-list', {
		path: '/games-list',
		waitOn: function() {
			return Meteor.subscribe('games');
		},
		data: function() {
			return {
				games: Games.find({}, {sort: [['createdAt', 'desc']]})
			};
		}
	});

	this.route('rank', {
		path: '/rank',
		waitOn: function() {
			return Meteor.subscribe('ranks');
		},
		data: function() {
			return {
				users: Meteor.users.find(),
				profiles: Profiles.find({}, {sort: [['eloRating', 'desc']]})
			};
		}
	});

	this.route('game', {
		path: '/:_id',
		waitOn: function() {
			return Meteor.subscribe('game', this.params._id);
		},
		data: function() {
			return {
				game: Games.findOne(this.params._id),
				players: Players.find({gameId: this.params._id}, {sort: ['joinedAt']}),
				profiles: Profiles.find(),
				eloScores: EloScores.find({gameId: this.params._id})
			};
		},
		onBeforeAction: function() {
			const game = Games.findOne(this.params._id);

			if (!game) {
				Router.go('home');
			} else {
				Session.set('game', this.params._id);
			}

			this.next();
		},
		action: function() {
			this.render('game');

			Template.game.rendered = function() {
				initGame(Session.get('game'));

				$(window).bind('beforeunload', function() {
					quitGame(Session.get('game'));
					destroyGame(Session.get('game'));
				});

				updateConnectionIndicator();

				Template.game.rendered = null;
			};
		},
		onStop: function() {
			quitGame(Session.get('game'));
			destroyGame(Session.get('game'));
			destroyConnectionIndicator();
			unsetGameSessions();
		}
	});
});
