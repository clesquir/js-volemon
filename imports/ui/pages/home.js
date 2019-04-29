import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedEloModeItem} from '/imports/api/ranks/utils';
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
const RankChartData = new RankChartCollection(null);

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

	'click [data-action=display-chart-elo-mode]': function(e) {
		const eloModeNode = $(e.target);
		const periodNode = $('span.active[data-action="display-chart-period"]').first();

		updateRankChart(eloModeNode, periodNode);
	},

	'click [data-action=display-chart-period]': function(e) {
		const eloModeNode = $('span.active[data-action="display-chart-elo-mode"]').first();
		const periodNode = $(e.target);

		updateRankChart(eloModeNode, periodNode);
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

			//Select the solo / 7 days by default
			updateRankChart(
				$('span[data-chart-elo-mode="solo"]').first(),
				$('span[data-chart-days="7"]').first()
			);
		}
	}

	static removeShownClasses(homeContents) {
		$(homeContents).removeClass('user-statistics-shown');
		$(homeContents).removeClass('user-achievements-shown');
		$(homeContents).removeClass('user-recent-games-shown');
		$(homeContents).removeClass('user-line-chart-shown');
	}
}

const updateRankChart = function(eloModeNode, periodNode) {
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

	Session.set('lineChartDisplayLoadingMask', true);

	if (!rankChart) {
		rankChart = new RankChart(
			'rank-line-chart-canvas',
			RankChartData.find({}, {sort: ['timestamp']})
		);
	}

	Meteor.call(
		'userRanksChart',
		eloModeNode.attr('data-chart-elo-mode'),
		minDateTime,
		[Meteor.userId()],
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
