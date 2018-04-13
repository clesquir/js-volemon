import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedChartPeriodItem} from '/imports/api/ranks/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {timeElapsedSince} from '/imports/lib/utils.js';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import {Meteor} from 'meteor/meteor';
import * as Moment from 'meteor/momentjs:moment';
import {Mongo} from 'meteor/mongo';
import {Template} from 'meteor/templating';

import './userProfileComponent.html';

class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection('userprofilerankchartdata');

Template.userProfileComponent.onCreated(function() {
	loadStatistics(Session.get('userProfile'), Session.get('tournament'));
});

let cardSwitcher;

Template.userProfileComponent.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.user-profile-swiper-container',
		{
			'user-profile-statistics': UserProfileViews.viewUserStatistics,
			'user-profile-recent-games': UserProfileViews.viewUserRecentGames,
			'user-profile-line-chart': UserProfileViews.viewUserLineChart,
		}
	);
});

/** @type {RankChart}|null */
let rankChart = null;
let rankChartSubscriptionHandler = null;

Template.userProfileComponent.destroyed = function() {
	rankChart = null;
	if (rankChartSubscriptionHandler) {
		rankChartSubscriptionHandler.stop();
	}
};

Template.userProfileComponent.helpers({
	userProfileName: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.username : '-';
	},

	userProfileId: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? '#' + userProfile.userId : '-';
	},

	userProfileEmail: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.email.split('').reverse().join('') : '-';
	},

	userProfileServiceName: function() {
		const userProfile = UserProfiles.findOne({userId: Session.get('userProfile')});

		return userProfile ? userProfile.serviceName : '';
	},

	getUserId: function() {
		return Session.get('userProfile');
	},

	isTournament: function() {
		return !!Session.get('tournament');
	}
});

Template.userProfileComponent.events({
	'click [data-action=view-user-profile-statistics]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-user-profile-recent-games]': function() {
		cardSwitcher.slideTo(1);
	},

	'click [data-action=view-user-profile-line-chart]': function() {
		cardSwitcher.slideTo(2);
	},

	'click [data-action=display-chart-all-time]': function(e) {
		updateRankChart(e, 'Oldest', false);
	},

	'click [data-action=display-chart-60-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 60);

		updateRankChart(e, '60 days ago', minDate);
	},

	'click [data-action=display-chart-30-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 30);

		updateRankChart(e, '30 days ago', minDate);
	},

	'click [data-action=display-chart-14-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 14);

		updateRankChart(e, '14 days ago', minDate);
	},

	'click [data-action=display-chart-7-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 7);

		updateRankChart(e, '7 days ago', minDate);
	}
});

class UserProfileViews {
	static viewUserStatistics() {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-profile-statistics-shown')) {
			UserProfileViews.removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-profile-statistics-shown');

			loadStatistics(Session.get('userProfile'), Session.get('tournament'));
		}
	}

	static viewUserRecentGames() {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-profile-recent-games-shown')) {
			UserProfileViews.removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-profile-recent-games-shown');

			initRecentGames(Session.get('userProfile'), Session.get('tournament'));
		}
	}

	static viewUserLineChart() {
		const userProfileContents = document.getElementById('user-profile-contents');

		if (!$(userProfileContents).is('.user-profile-line-chart-shown')) {
			UserProfileViews.removeShownClasses(userProfileContents);
			$(userProfileContents).addClass('user-profile-line-chart-shown');

			if (Session.get('tournament')) {
				const tournament = Tournaments.findOne({_id: Session.get('tournament')});

				if (tournament) {
					const date = Moment.moment(tournament.startDate, 'YYYY-MM-DD ZZ');
					updateRankChart(null, timeElapsedSince(date.valueOf()), false);
				}
			} else {
				//Select the 7 days by default
				$('span[data-action="display-chart-7-days"]').first().trigger('click');
			}
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-profile-statistics-shown');
		$(homeContents).removeClass('user-profile-recent-games-shown');
		$(homeContents).removeClass('user-profile-line-chart-shown');
	}
}

const updateRankChart = function(e, minDateLabel, minDate) {
	if (e) {
		highlightSelectedChartPeriodItem(e);
	}

	let minDateTime = 0;
	if (minDate) {
		minDateTime = minDate.getTime();
	}

	Session.set('lineChartDisplayLoadingMask', true);

	if (!rankChart) {
		rankChart = new RankChart(
			'rank-line-chart-canvas',
			RankChartData.find({}, {sort: ['timestamp']})
		);
	}

	if (rankChartSubscriptionHandler) {
		rankChartSubscriptionHandler.stop();
	}
	rankChartSubscriptionHandler = Meteor.subscribe('userProfileRanksChart', minDateTime, [Session.get('userProfile')], Session.get('tournament'), () => {
		rankChart.update(minDateLabel, minDate);
		Session.set('lineChartDisplayLoadingMask', false);
	});
};
