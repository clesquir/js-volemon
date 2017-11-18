import {Meteor} from 'meteor/meteor';
import {Router} from 'meteor/iron:router';
import {GameController} from '/imports/startup/client/controllers/GameController.js';
import {GamesController} from '/imports/startup/client/controllers/GamesController.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';
import {RankController} from '/imports/startup/client/controllers/RankController.js';
import {TournamentsController} from '/imports/startup/client/controllers/TournamentsController.js';
import {TournamentController} from '/imports/startup/client/controllers/TournamentController.js';
import {TournamentGameController} from '/imports/startup/client/controllers/TournamentGameController.js';
import {TournamentUserProfileController} from '/imports/startup/client/controllers/TournamentUserProfileController.js';
import {UserProfileController} from '/imports/startup/client/controllers/UserProfileController.js';

import '/imports/ui/pages/app.js';
import '/imports/ui/pages/game.js';
import '/imports/ui/pages/games.js';
import '/imports/ui/pages/home.js';
import '/imports/ui/pages/login.js';
import '/imports/ui/pages/passwordChange.js';
import '/imports/ui/pages/rank.js';
import '/imports/ui/pages/skins.js';
import '/imports/ui/pages/tournaments.js';
import '/imports/ui/pages/tournament.js';
import '/imports/ui/pages/tournamentGame.js';
import '/imports/ui/pages/tournamentUserProfile.js';
import '/imports/ui/pages/username.js';
import '/imports/ui/pages/userProfile.js';
import '/imports/ui/pages/dev/environment.js';
import '/imports/ui/pages/dev/shape.js';

import '/imports/ui/components/achievementPopup.js';
import '/imports/ui/components/achievementRanking.js';
import '/imports/ui/components/achievements.js';
import '/imports/ui/components/afterGame.js';
import '/imports/ui/components/eloRanking.js';
import '/imports/ui/components/eloRatingChange.js';
import '/imports/ui/components/lightbox.js';
import '/imports/ui/components/loading.js';
import '/imports/ui/components/gameCanvas.js';
import '/imports/ui/components/gameSetup.js';
import '/imports/ui/components/gamesList.js';
import '/imports/ui/components/reactions.js';
import '/imports/ui/components/recentGames.js';
import '/imports/ui/components/shapeSelector.js';
import '/imports/ui/components/statistics.js';
import '/imports/ui/components/switchButton.js';
import '/imports/ui/components/userProfileComponent.js';

Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [
			Meteor.subscribe('userConfiguration', Meteor.userId()),
			Meteor.subscribe('achievements'),
			Meteor.subscribe('userAchievements', Meteor.userId()),
			Meteor.subscribe('skins')
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
		this.route('environment', {
			path: '/dev/environment'
		});
		this.route('shape', {
			path: '/dev/shape'
		});
	}

	this.route('userProfile', {
		path: '/profile/:userId',
		controller: UserProfileController
	});

	this.route('games', {
		path: '/games',
		controller: GamesController
	});

	this.route('rank', {
		path: '/rank',
		controller: RankController
	});

	this.route('tournaments', {
		path: '/tournaments',
		controller: TournamentsController
	});

	this.route('tournament', {
		path: '/tournament/:tournamentId',
		controller: TournamentController
	});

	this.route('tournamentGame', {
		path: '/tournament/:tournamentId/game/:gameId',
		controller: TournamentGameController
	});

	this.route('tournamentUserProfile', {
		path: '/tournament/:tournamentId/profile/:userId',
		controller: TournamentUserProfileController
	});

	this.route('game', {
		path: '/game/:_id',
		controller: GameController
	});
});
