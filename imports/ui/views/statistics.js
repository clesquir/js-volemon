import {INITIAL_ELO_RATING} from '/imports/api/profiles/constants.js';
import TournamentMode from '/imports/api/tournaments/TournamentMode';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import {getWinRateFromNumbers} from '/imports/lib/utils.js';
import {Meteor} from 'meteor/meteor';
import moment from 'moment';
import {Session} from 'meteor/session';
import {Template} from 'meteor/templating';

import './statistics.html';

export const loadStatistics = function(userId, tournamentId) {
	Meteor.subscribe('profileData', userId);

	Session.set('numberOfGamesPlayed', null);
	Session.set('numberOfShutouts', null);
	Session.set('longestGame', null);
	Session.set('longestPoint', null);
	Session.set('lowestElo', null);
	Session.set('highestElo', null);
	Session.set('currentElo', null);
	Session.set('totalPlayingTime', null);
	Session.set('statisticFavouriteShapes', null);

	Meteor.call('numberOfGamesPlayed', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('numberOfGamesPlayed', data);
		}
	});
	Meteor.call('numberOfShutouts', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('numberOfShutouts', data);
		}
	});
	Meteor.call('longestGame', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('longestGame', data);
		}
	});
	Meteor.call('longestPoint', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('longestPoint', data);
		}
	});
	Meteor.call('lowestElo', userId, tournamentId, function(error, data) {
		if (!error) {
			Session.set('lowestElo', data);
		}
	});
	Meteor.call('highestElo', userId, tournamentId, function(error, data) {
		if (!error) {
			Session.set('highestElo', data);
		}
	});
	Meteor.call('currentElo', userId, tournamentId, function(error, data) {
		if (!error) {
			Session.set('currentElo', data);
		}
	});
	Meteor.call('totalPlayingTime', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('totalPlayingTime', data);
		}
	});
	Meteor.call('favouriteShapes', userId, tournamentId, function(error, data) {
		if (!error && data) {
			Session.set('statisticFavouriteShapes', data);
		}
	});
};

Template.statistics.helpers({
	numberOfGamesPlayed: function() {
		if (Session.get('numberOfGamesPlayed')) {
			if (Object.keys(Session.get('numberOfGamesPlayed')).length > 0) {
				return Session.get('numberOfGamesPlayed').numberOfGame;
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	winRate: function() {
		if (Session.get('numberOfGamesPlayed')) {
			if (Object.keys(Session.get('numberOfGamesPlayed')).length > 0) {
				return getWinRateFromNumbers(
					Session.get('numberOfGamesPlayed').numberOfWin,
					Session.get('numberOfGamesPlayed').numberOfLost
				);
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	showShutoutsStatistics: function(tournamentId) {
		if (tournamentId) {
			const tournament = Tournaments.findOne({_id: tournamentId});

			if (tournament) {
				const mode = TournamentMode.fromTournament(tournament);

				return !mode.overridesMaximumPoints() || mode.maximumPoints() > 1;
			}
		}

		return true;
	},

	numberOfShutouts: function() {
		if (Session.get('numberOfShutouts')) {
			if (Object.keys(Session.get('numberOfShutouts')).length > 0) {
				return Session.get('numberOfShutouts').numberOfShutouts;
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	numberOfShutoutLosses: function() {
		if (Session.get('numberOfShutouts')) {
			if (Object.keys(Session.get('numberOfShutouts')).length > 0) {
				return Session.get('numberOfShutouts').numberOfShutoutLosses;
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	longestGameInformation: function(statisticName) {
		if (Session.get(statisticName)) {
			if (Object.keys(Session.get(statisticName)).length > 0) {
				return 'Game date: ' + moment(Session.get(statisticName).startedAt).format('YYYY-MM-DD HH:mm') + '<br />' +
					'Opponent: ' + Session.get(statisticName).playerName;
			} else {
				return '';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	longestGameDuration: function(statisticName) {
		if (Session.get(statisticName)) {
			if (Object.keys(Session.get(statisticName)).length > 0) {
				return moment(Session.get(statisticName).duration).format('mm:ss');
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloStatInformation: function(statisticName) {
		if (Session.get(statisticName) !== null) {
			if (!Session.get(statisticName)) {
				return '';
			}
			return 'Game date: ' + moment(Session.get(statisticName).timestamp).format('YYYY-MM-DD HH:mm');
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloStat: function(statisticName) {
		if (Session.get(statisticName) !== null) {
			if (!Session.get(statisticName)) {
				return INITIAL_ELO_RATING;
			}
			return Session.get(statisticName).eloRating;
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloRating: function() {
		if (Session.get('currentElo') !== null) {
			if (!Session.get('currentElo')) {
				return INITIAL_ELO_RATING;
			}
			return Session.get('currentElo').eloRating;
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloRatingLastChange: function() {
		if (Session.get('currentElo') !== null) {
			if (!Session.get('currentElo')) {
				return null;
			}
			return Session.get('currentElo').eloRatingLastChange;
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	totalPlayingTime: function() {
		if (Session.get('totalPlayingTime')) {
			if (Object.keys(Session.get('totalPlayingTime')).length > 0) {
				return Session.get('totalPlayingTime').totalPlayingTime;
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	totalPlayingTimeTooltip: function() {
		if (Session.get('totalPlayingTime')) {
			if (Object.keys(Session.get('totalPlayingTime')).length > 0 && Session.get('totalPlayingTime').firstGame) {
				return 'First game: ' + moment(Session.get('totalPlayingTime').firstGame).format('YYYY-MM-DD HH:mm') + '<br />' +
					'Last game: ' + moment(Session.get('totalPlayingTime').lastGame).format('YYYY-MM-DD HH:mm');
			} else {
				return '';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	hasFavouriteShapesLoaded: function() {
		return (Session.get('statisticFavouriteShapes'));
	},

	favouriteShapes: function() {
		const shapes = Session.get('statisticFavouriteShapes');
		if (shapes && Object.keys(shapes).length > 0) {
			const shapeKeys = Object.keys(shapes).sort(
				function(a, b) {
					return shapes[b] - shapes[a];
				}
			);

			const orderedShapesArray = [];
			shapeKeys.forEach(function(key) {
				orderedShapesArray.push({shape: key, number: shapes[key]});
			});

			return orderedShapesArray;
		}

		return [];
	},

	favouriteShape: function() {
		const shapes = Session.get('statisticFavouriteShapes');
		if (shapes) {
			const shapeKeys = Object.keys(shapes).sort(
				function(a, b) {
					return shapes[b] - shapes[a];
				}
			);

			if (shapeKeys.length) {
				return '<div class="shape-selector-container shape-' + shapeKeys[0] + '">' +
						'<div class="shape-content-scroller"></div>' +
					'</div>';
			} else {
				return 'N/A';
			}
		}

		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	}
});
