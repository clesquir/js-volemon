import {GameController} from '/imports/startup/client/controllers/GameController';
import {GameReplayController} from '/imports/startup/client/controllers/GameReplayController';
import {GamesController} from '/imports/startup/client/controllers/GamesController';
import {HomeController} from '/imports/startup/client/controllers/HomeController';
import {MatchMakingController} from '/imports/startup/client/controllers/MatchMakingController';
import {RankController} from '/imports/startup/client/controllers/RankController';
import {TournamentAdministrationController} from '/imports/startup/client/controllers/TournamentAdministrationController';
import {TournamentController} from '/imports/startup/client/controllers/TournamentController';
import {TournamentGameController} from '/imports/startup/client/controllers/TournamentGameController';
import {TournamentGameReplayController} from '/imports/startup/client/controllers/TournamentGameReplayController';
import {TournamentsController} from '/imports/startup/client/controllers/TournamentsController';
import {TournamentUserProfileController} from '/imports/startup/client/controllers/TournamentUserProfileController';
import {UserProfileController} from '/imports/startup/client/controllers/UserProfileController';
import {UserSettingsController} from '/imports/startup/client/controllers/UserSettingsController';

import '/imports/ui/components/lightbox';
import '/imports/ui/components/loading';
import '/imports/ui/components/matchMaking';
import '/imports/ui/components/multipleBonusSelectSwitch';
import '/imports/ui/components/multipleSelectSwitch';
import '/imports/ui/components/multipleShapeSelectSwitch';
import '/imports/ui/components/noInternetConnection';
import '/imports/ui/components/numberSwitch';
import '/imports/ui/components/selectSwitch';
import '/imports/ui/components/shapeSelector';
import '/imports/ui/components/switchButton';
import '/imports/ui/components/textSwitch';

import '/imports/ui/pages/app';
import '/imports/ui/pages/dev/ai';
import '/imports/ui/pages/dev/engine';
import '/imports/ui/pages/dev/environment';
import '/imports/ui/pages/dev/shape';
import '/imports/ui/pages/dev/skin';
import '/imports/ui/pages/game';
import '/imports/ui/pages/games';
import '/imports/ui/pages/help';
import '/imports/ui/pages/home';
import '/imports/ui/pages/keymaps';
import '/imports/ui/pages/login';
import '/imports/ui/pages/passwordChange';
import '/imports/ui/pages/rank';
import '/imports/ui/pages/skins';
import '/imports/ui/pages/tournament';
import '/imports/ui/pages/tournamentAdministration';
import '/imports/ui/pages/tournamentGame';
import '/imports/ui/pages/tournaments';
import '/imports/ui/pages/tournamentUserProfile';
import '/imports/ui/pages/username';
import '/imports/ui/pages/userProfile';
import '/imports/ui/pages/userReactions';
import '/imports/ui/pages/userSettings';
import '/imports/ui/views/achievementPopup';
import '/imports/ui/views/achievementRanking';
import '/imports/ui/views/achievements';
import '/imports/ui/views/afterGame';
import '/imports/ui/views/eloRanking';
import '/imports/ui/views/eloRatingChange';
import '/imports/ui/views/gameCanvas';
import '/imports/ui/views/gameReplayControls';
import '/imports/ui/views/gameSetup';
import '/imports/ui/views/gamesList';
import '/imports/ui/views/privacyPolicy';
import '/imports/ui/views/reactions';
import '/imports/ui/views/reactionsList';
import '/imports/ui/views/recentGames';
import '/imports/ui/views/statistics';
import '/imports/ui/views/userProfileComponent';
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
		this.route('engine', {
			path: '/dev/engine'
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

	this.route('gameReplay', {
		path: '/game/:_id/replay',
		controller: GameReplayController
	});

	this.route('tournamentGameReplay', {
		path: '/tournament/:tournamentId/game/:gameId/replay',
		controller: TournamentGameReplayController
	});

	this.route('privacyPolicy', {
		path: '/privacy-policy'
	});
});
