import {GameController} from '/imports/startup/client/controllers/GameController.js';
import {GamesController} from '/imports/startup/client/controllers/GamesController.js';
import {HomeController} from '/imports/startup/client/controllers/HomeController.js';
import {MatchMakingController} from '/imports/startup/client/controllers/MatchMakingController.js';
import {RankController} from '/imports/startup/client/controllers/RankController.js';
import {TournamentAdministrationController} from '/imports/startup/client/controllers/TournamentAdministrationController.js';
import {TournamentController} from '/imports/startup/client/controllers/TournamentController.js';
import {TournamentGameController} from '/imports/startup/client/controllers/TournamentGameController.js';
import {TournamentsController} from '/imports/startup/client/controllers/TournamentsController.js';
import {TournamentUserProfileController} from '/imports/startup/client/controllers/TournamentUserProfileController.js';
import {UserProfileController} from '/imports/startup/client/controllers/UserProfileController.js';
import {UserSettingsController} from '/imports/startup/client/controllers/UserSettingsController.js';

import '/imports/ui/components/lightbox.js';
import '/imports/ui/components/loading.js';
import '/imports/ui/components/matchMaking.js';
import '/imports/ui/components/multipleSelectSwitch.js';
import '/imports/ui/components/noInternetConnection.js';
import '/imports/ui/components/numberSwitch.js';
import '/imports/ui/components/selectSwitch.js';
import '/imports/ui/components/shapeSelector.js';
import '/imports/ui/components/switchButton.js';
import '/imports/ui/components/textSwitch.js';

import '/imports/ui/pages/app.js';
import '/imports/ui/pages/dev/ai.js';
import '/imports/ui/pages/dev/environment.js';
import '/imports/ui/pages/dev/shape.js';
import '/imports/ui/pages/dev/skin.js';
import '/imports/ui/pages/game.js';
import '/imports/ui/pages/games.js';
import '/imports/ui/pages/help.js';
import '/imports/ui/pages/home.js';
import '/imports/ui/pages/keymaps.js';
import '/imports/ui/pages/login.js';
import '/imports/ui/pages/passwordChange.js';
import '/imports/ui/pages/rank.js';
import '/imports/ui/pages/skins.js';
import '/imports/ui/pages/tournament.js';
import '/imports/ui/pages/tournamentAdministration.js';
import '/imports/ui/pages/tournamentGame.js';
import '/imports/ui/pages/tournaments.js';
import '/imports/ui/pages/tournamentUserProfile.js';
import '/imports/ui/pages/username.js';
import '/imports/ui/pages/userProfile.js';
import '/imports/ui/pages/userReactions.js';
import '/imports/ui/pages/userSettings.js';
import '/imports/ui/views/achievementPopup.js';
import '/imports/ui/views/achievementRanking.js';
import '/imports/ui/views/achievements.js';
import '/imports/ui/views/afterGame.js';
import '/imports/ui/views/eloRanking.js';
import '/imports/ui/views/eloRatingChange.js';
import '/imports/ui/views/gameCanvas.js';
import '/imports/ui/views/gameSetup.js';
import '/imports/ui/views/gamesList.js';
import '/imports/ui/views/privacyPolicy.js';
import '/imports/ui/views/reactions.js';
import '/imports/ui/views/reactionsList.js';
import '/imports/ui/views/recentGames.js';
import '/imports/ui/views/statistics.js';
import '/imports/ui/views/userProfileComponent.js';
import {Router} from 'meteor/iron:router';
import {Tooltips} from 'meteor/lookback:tooltips';
import {Meteor} from 'meteor/meteor';

Router.configure({
	layoutTemplate: 'app',
	loadingTemplate: 'loading',
	waitOn: function() {
		return [
			Meteor.subscribe('userConfiguration', Meteor.userId()),
			Meteor.subscribe('userKeymaps', Meteor.userId()),
			Meteor.subscribe('userReactions', Meteor.userId()),
			Meteor.subscribe('achievements'),
			Meteor.subscribe('userAchievements', Meteor.userId()),
			Meteor.subscribe('skins')
		];
	},
	onBeforeAction: function() {
		Tooltips.hide();
		this.next();
	}
});

Router.map(function() {
	this.route('home', {
		path: '/',
		controller: HomeController
	});

	this.route('userSettings', {
		path: '/settings',
		controller: UserSettingsController
	});

	//This is use for various game environment tests
	if (Meteor.isDevelopment) {
		this.route('ai', {
			path: '/dev/ai'
		});
		this.route('environment', {
			path: '/dev/environment'
		});
		this.route('shape', {
			path: '/dev/shape'
		});
		this.route('skin', {
			path: '/dev/skin'
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

	this.route('tournamentAdministration', {
		path: '/tournament-administration/:tournamentId',
		controller: TournamentAdministrationController
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

	this.route('matchMaking', {
		path: '/match-making/:modeSelection/tournament/:tournamentId',
		controller: MatchMakingController
	});

	this.route('game', {
		path: '/game/:_id',
		controller: GameController
	});

	this.route('privacyPolicy', {
		path: '/privacy-policy'
	});
});
