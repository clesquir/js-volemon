import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedChartPeriodItem} from '/imports/api/ranks/utils.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {browserSupportsWebRTC, onMobileAndTablet} from '/imports/lib/utils.js';
import {initRecentGames} from '/imports/ui/views/recentGames.js';
import {loadStatistics} from '/imports/ui/views/statistics.js';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Template} from 'meteor/templating';

import './home.html';

class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection('userrankchartdata');

Template.home.onCreated(function() {
	loadStatistics(Meteor.userId());
});

let cardSwitcher;

Template.home.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.home-swiper-container',
		{
			'user-statistics': HomeViews.viewUserStatistics,
			'user-achievements': HomeViews.viewUserAchievements,
			'user-recent-games': HomeViews.viewUserRecentGames,
			'user-line-chart': HomeViews.viewUserLineChart,
		}
	);
});

/** @type {RankChart}|null */
let rankChart = null;
let rankChartSubscriptionHandler = null;

Template.home.destroyed = function() {
	rankChart = null;
	if (rankChartSubscriptionHandler) {
		rankChartSubscriptionHandler.stop();
	}
};

Template.home.helpers({
	browserDoNotSupportsWebRTC: function() {
		return !browserSupportsWebRTC();
	},

	onMobile: function() {
		return onMobileAndTablet();
	},

	getUserId: function() {
		return Meteor.userId();
	}
});

Template.home.events({
	'click [data-action=view-user-statistics]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-user-achievements]': function() {
		cardSwitcher.slideTo(1);
	},

	'click [data-action=view-user-recent-games]': function() {
		cardSwitcher.slideTo(2);
	},

	'click [data-action=view-user-line-chart]': function() {
		cardSwitcher.slideTo(3);
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

class HomeViews {
	static viewUserStatistics() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-statistics-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-statistics-shown');

			loadStatistics(Meteor.userId());
		}
	}

	static viewUserAchievements() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-achievements-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-achievements-shown');
		}
	}

	static viewUserRecentGames() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-recent-games-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-recent-games-shown');

			initRecentGames(Meteor.userId());
		}
	}

	static viewUserLineChart() {
		const homeContents = document.getElementById('home-contents');

		if (!$(homeContents).is('.user-line-chart-shown')) {
			HomeViews.removeShownClasses(homeContents);
			$(homeContents).addClass('user-line-chart-shown');

			//Select the 7 days by default
			$('span[data-action="display-chart-7-days"]').first().trigger('click');
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-statistics-shown');
		$(homeContents).removeClass('user-achievements-shown');
		$(homeContents).removeClass('user-recent-games-shown');
		$(homeContents).removeClass('user-line-chart-shown');
	}
}

const updateRankChart = function(e, minDateLabel, minDate) {
	highlightSelectedChartPeriodItem(e);

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
	rankChartSubscriptionHandler = Meteor.subscribe('userRanksChart', minDateTime, [Meteor.userId()], () => {
		rankChart.update(minDateLabel, minDate);
		Session.set('lineChartDisplayLoadingMask', false);
	});
};
