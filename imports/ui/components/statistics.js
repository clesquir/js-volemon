import {Meteor} from 'meteor/meteor';
import {Template} from 'meteor/templating';
import * as Moment from 'meteor/momentjs:moment';
import {Session} from 'meteor/session';

import './statistics.html';

export const loadStatistics = function(userId) {
	const profileData = Meteor.subscribe('profileData', userId);

	Meteor.call('longestGame', userId, function(error, data) {
		if (!error && data.gameId) {
			Session.set('longestGame', data);
		}
	});
	Meteor.call('longestPoint', userId, function(error, data) {
		if (!error && data.gameId) {
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
};

Template.statistics.helpers({
	numberOfGamesPlayed: function() {
		if (!this.profile) {
			return '-';
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
			return 'Game date: ' + Moment.moment(Session.get(statisticName).startedAt).format('YYYY-MM-DD HH:mm') + '<br />' +
				'Opponent: ' + Session.get(statisticName).playerName;
		}
		return '';
	},

	longestGameDuration: function(statisticName) {
		if (Session.get(statisticName)) {
			return Moment.moment(Session.get(statisticName).duration).format('mm:ss');
		}
		return '-';
	},

	eloStatInformation: function(statisticName) {
		if (Session.get(statisticName)) {
			return 'Game date: ' + Moment.moment(Session.get(statisticName).timestamp).format('YYYY-MM-DD HH:mm');
		}
		return '';
	},

	eloStat: function(statisticName) {
		if (Session.get(statisticName)) {
			return Session.get(statisticName).eloRating;
		}
		return '-';
	}
});
