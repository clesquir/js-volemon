import {UserProfiles} from '/imports/api/profiles/userprofiles.js';
import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedEloModeItem} from '/imports/api/ranks/utils';
import {highlightSelectedChartPeriodItem} from '/imports/api/ranks/utils.js';
import {Tournaments} from '/imports/api/tournaments/tournaments.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {timeElapsedSince} from '/imports/lib/utils.js';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import {Meteor} from 'meteor/meteor';
import moment from 'moment';
import {Mongo} from 'meteor/mongo';
import {Template} from 'meteor/templating';

import './userProfileComponent.html';

class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection(null);

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

	'click [data-action=display-chart-elo-mode]': function(e) {
		const eloModeNode = $(e.target);
		const periodNode = $('span.active[data-action="display-chart-period"]').first();

		updateUserRankChart(eloModeNode, periodNode);
	},

	'click [data-action=display-chart-period]': function(e) {
		const eloModeNode = $('span.active[data-action="display-chart-elo-mode"]').first();
		const periodNode = $(e.target);

		updateUserRankChart(eloModeNode, periodNode);
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
					updateTournamentRankChart(tournament);
				}
			} else {
				//Select the solo / 7 days by default
				updateUserRankChart(
					$('span[data-chart-elo-mode="solo"]').first(),
					$('span[data-chart-days="7"]').first()
				);
			}
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-profile-statistics-shown');
		$(homeContents).removeClass('user-profile-recent-games-shown');
		$(homeContents).removeClass('user-profile-line-chart-shown');
	}
}

const updateTournamentRankChart = function(tournament) {
	const date = moment(tournament.startDate, 'YYYY-MM-DD ZZ');

	updateRankChart(
		null,
		timeElapsedSince(date.valueOf()),
		0,
		false
	);
};

const updateUserRankChart = function(eloModeNode, periodNode) {
	highlightSelectedEloModeItem(eloModeNode);
	highlightSelectedChartPeriodItem(periodNode);

	const chartMinimumLabel = periodNode.attr('data-chart-label');
	const chartDays = periodNode.attr('data-chart-days');

	let minDateTime = 0;
	let minDate = false;
	if (chartDays !== 'false') {
		minDate = new Date();
		minDate.setDate(minDate.getDate() - chartDays);
		minDateTime = minDate.getTime();
	}

	updateRankChart(
		eloModeNode.attr('data-chart-elo-mode'),
		chartMinimumLabel,
		minDateTime,
		minDate
	);
};

const updateRankChart = function(eloMode, chartMinimumLabel, minDateTime, minDate) {
	Session.set('lineChartDisplayLoadingMask', true);

	if (!rankChart) {
		rankChart = new RankChart(
			'rank-line-chart-canvas',
			RankChartData.find({}, {sort: ['timestamp']})
		);
	}

	Meteor.call(
		'userProfileRanksChart',
		eloMode,
		minDateTime,
		[Session.get('userProfile')],
		Session.get('tournament'),
		(error, data) => {
			RankChartData.remove({});

			for (let datum of data) {
				RankChartData.insert(datum);
			}

			rankChart.update(chartMinimumLabel, minDate);
			Session.set('lineChartDisplayLoadingMask', false);
		}
	);
};
