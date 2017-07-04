import {Meteor} from 'meteor/meteor';
import {GameController} from '/imports/startup/client/controllers/GameController.js';
import {GamesListController} from '/imports/startup/client/controllers/GamesListController.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';
import {RankController} from '/imports/startup/client/controllers/RankController.js';

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
import '/imports/ui/components/afterGame.js';
import '/imports/ui/components/eloRatingChange.js';
import '/imports/ui/components/lightbox.js';
import '/imports/ui/components/loading.js';
import '/imports/ui/components/gameSetup.js';
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
		controller: GamesListController
	});

	this.route('rank', {
		path: '/rank',
		controller: RankController
	});

	this.route('game', {
		path: '/:_id',
		controller: GameController
	});
});
