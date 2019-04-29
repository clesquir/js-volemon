import RankChart from '/imports/api/ranks/client/RankChart.js';
import {highlightSelectedEloModeItem} from '/imports/api/ranks/utils';
import {highlightSelectedChartPeriodItem} from '/imports/api/ranks/utils.js';
import CardSwitcher from '/imports/lib/client/CardSwitcher.js';
import {Meteor} from 'meteor/meteor';
import {Mongo} from 'meteor/mongo';
import {Template} from 'meteor/templating';

import './rank.html';

class RankingsCollection extends Mongo.Collection {}
const Rankings = new RankingsCollection('rankings');
class TeamRankingsCollection extends Mongo.Collection {}
const TeamRankings = new TeamRankingsCollection('teamrankings');
class RankChartCollection extends Mongo.Collection {}
const RankChartData = new RankChartCollection(null);
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
const rankingEloMode = new ReactiveVar('solo');

Template.rank.destroyed = function() {
	rankChart = null;
	rankingEloMode.set('solo');
};

Template.rank.helpers({
	getRankings: function() {
		if (rankingEloMode.get() === 'solo') {
			return Rankings.find({}, {sort: [['eloRating', 'desc']]});
		} else {
			return TeamRankings.find({}, {sort: [['eloRating', 'desc']]});
		}
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

	'click [data-action=display-ranking-elo-mode]': function(e) {
		const eloModeNode = $(e.target);

		rankingEloMode.set(eloModeNode.attr('data-chart-elo-mode'));
		highlightSelectedEloModeItem(eloModeNode);
	},

	'click [data-action=display-chart-elo-mode]': function(e) {
		const eloModeNode = $(e.target);
		const periodNode = $('span.active[data-action="display-chart-period"]').first();

		updateRankChart(eloModeNode, periodNode);
	},

	'click [data-action=display-chart-period]': function(e) {
		const eloModeNode = $('span.active[data-action="display-chart-elo-mode"][data-action="display-chart-elo-mode"]').first();
		const periodNode = $(e.target);

		updateRankChart(eloModeNode, periodNode);
	}
});

class RankViews {
	static viewEloRanking() {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.rank-elo-ranking-shown')) {
			RankViews.removeShownClasses(rankDisplay);
			$(rankDisplay).addClass('rank-elo-ranking-shown');

			rankingEloMode.set('solo');
			highlightSelectedEloModeItem($('span[data-action="display-ranking-elo-mode"][data-chart-elo-mode="solo"]').first());
		}
	}

	static viewLineChartDisplay() {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.rank-line-chart-display-shown')) {
			RankViews.removeShownClasses(rankDisplay);
			$(rankDisplay).addClass('rank-line-chart-display-shown');

			//Select the solo / 7 days by default
			updateRankChart(
				$('span[data-action="display-chart-elo-mode"][data-chart-elo-mode="solo"]').first(),
				$('span[data-chart-days="7"]').first()
			);
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
		'ranksChart',
		eloModeNode.attr('data-chart-elo-mode'),
		minDateTime,
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
