import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedChartPeriodItem} from '/imports/api/ranks/utils.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Template} from 'meteor/templating';

import './rank.html';

class RankingsCollection extends Mongo.Collection {}
const Rankings = new RankingsCollection('rankings');
class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection('rankchartdata');
class AchievementsRankingCollection extends Mongo.Collection {}
const AchievementsRanking = new AchievementsRankingCollection('achievementsranking');

let cardSwitcher;

Template.rank.onRendered(function() {
	cardSwitcher = new CardSwitcher(
		'.rank-swiper-container',
		{
			'rank-elo-ranking': RankViews.viewEloRanking,
			'rank-line-chart-display': RankViews.viewLineChartDisplay,
			'rank-achievements-ranking': RankViews.viewAchievementsRanking,
		}
	);
});

/** @type {RankChart}|null */
let rankChart = null;

Template.rank.destroyed = function() {
	rankChart = null;
};

Template.rank.helpers({
	getRankings: function() {
		return Rankings.find({}, {sort: [['eloRating', 'desc']]});
	},

	getAchievementRankings: function() {
		return AchievementsRanking.find({}, {sort: [['rank', 'desc']]});
	}
});

Template.rank.events({
	'click [data-action=view-elo-ranking]': function() {
		cardSwitcher.slideTo(0);
	},

	'click [data-action=view-line-chart-display]': function() {
		cardSwitcher.slideTo(1);
	},

	'click [data-action=view-achievements-ranking]': function() {
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

class RankViews {
	static viewEloRanking() {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.rank-elo-ranking-shown')) {
			RankViews.removeShownClasses(rankDisplay);
			$(rankDisplay).addClass('rank-elo-ranking-shown');
		}
	}

	static viewLineChartDisplay() {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.rank-line-chart-display-shown')) {
			RankViews.removeShownClasses(rankDisplay);
			$(rankDisplay).addClass('rank-line-chart-display-shown');

			//Select the 7 days by default
			$('span[data-action="display-chart-7-days"]').first().trigger('click');
		}
	}

	static viewAchievementsRanking() {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.rank-achievements-ranking-shown')) {
			RankViews.removeShownClasses(rankDisplay);
			$(rankDisplay).addClass('rank-achievements-ranking-shown');

			Session.set('achievementsRankingLoadingMask', true);
			Meteor.subscribe('achievementsRanking', () => {
				Session.set('achievementsRankingLoadingMask', false);
			});
		}
	}

	static removeShownClasses(rankDisplay) {
		$(rankDisplay).removeClass('rank-elo-ranking-shown');
		$(rankDisplay).removeClass('rank-achievements-ranking-shown');
		$(rankDisplay).removeClass('rank-line-chart-display-shown');
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

	Meteor.subscribe('ranks-chart', minDateTime, () => {
		rankChart.update(minDateLabel, minDate);
		Session.set('lineChartDisplayLoadingMask', false);
	});
};
