import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import * as Moment from 'meteor/momentjs:moment';
import {Session} from 'meteor/session';
import {getWinRate} from '/imports/lib/utils.js';

import './statistics.html';

export const loadStatistics = function(userId) {
	Meteor.subscribe('profileData', userId);

	Session.set('longestGame', undefined);
	Session.set('longestPoint', undefined);
	Session.set('lowestElo', undefined);
	Session.set('highestElo', undefined);
	Session.set('totalPlayingTime', undefined);
	Session.set('statisticFavouriteShapes', undefined);

	Meteor.call('longestGame', userId, function(error, data) {
		if (!error && data) {
			Session.set('longestGame', data);
		}
	});
	Meteor.call('longestPoint', userId, function(error, data) {
		if (!error && data) {
			Session.set('longestPoint', data);
		}
	});
	Meteor.call('lowestElo', userId, function(error, data) {
		if (!error && data) {
			Session.set('lowestElo', data);
		}
	});
	Meteor.call('highestElo', userId, function(error, data) {
		if (!error && data) {
			Session.set('highestElo', data);
		}
	});
	Meteor.call('totalPlayingTime', userId, function(error, data) {
		if (!error && data) {
			Session.set('totalPlayingTime', data);
		}
	});
	Meteor.call('favouriteShapes', userId, function(error, data) {
		if (!error && data) {
			Session.set('statisticFavouriteShapes', data);
		}
	});
};

Template.statistics.helpers({
	numberOfGamesPlayed: function() {
		if (!this.profile) {
			return 0;
		}

		return this.profile.numberOfWin + this.profile.numberOfLost;
	},

	winRate: function() {
		if (!this.profile) {
			return '-';
		}

		return getWinRate(this.profile);
	},

	numberOfShutouts: function() {
		if (!this.profile) {
			return '-';
		}

		return this.profile.numberOfShutouts;
	},

	numberOfShutoutLosses: function() {
		if (!this.profile) {
			return '-';
		}

		return this.profile.numberOfShutoutLosses;
	},

	longestGameInformation: function(statisticName) {
		if (Session.get(statisticName)) {
			if (Object.keys(Session.get(statisticName)).length > 0) {
				return 'Game date: ' + Moment.moment(Session.get(statisticName).startedAt).format('YYYY-MM-DD HH:mm') + '<br />' +
					'Opponent: ' + Session.get(statisticName).playerName;
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	longestGameDuration: function(statisticName) {
		if (Session.get(statisticName)) {
			if (Object.keys(Session.get(statisticName)).length > 0) {
				return Moment.moment(Session.get(statisticName).duration).format('mm:ss');
			} else {
				return '-';
			}
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloStatInformation: function(statisticName) {
		if (Session.get(statisticName)) {
			return 'Game date: ' + Moment.moment(Session.get(statisticName).timestamp).format('YYYY-MM-DD HH:mm');
		}
		return '<div class="loading-icon fa fa-spinner fa-pulse" />';
	},

	eloStat: function(statisticName) {
		if (Session.get(statisticName) !== undefined) {
			return Session.get(statisticName).eloRating;
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
				return 'First game: ' + Moment.moment(Session.get('totalPlayingTime').firstGame).format('YYYY-MM-DD HH:mm') + '<br />' +
					'Last game: ' + Moment.moment(Session.get('totalPlayingTime').lastGame).format('YYYY-MM-DD HH:mm');
			} else {
				return '-';
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
