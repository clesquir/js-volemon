import RankChart from '/client/lib/RankChart.js';
import { EloScores } from '/collections/eloscores.js';
import { Profiles } from '/collections/profiles.js';

Template.rank.helpers({
	getHighlightedClassIfCurrentUser: function() {
		if (this.userId == Meteor.userId()) {
			return 'highlighted-row';
		}

		return '';
	},

	getRank: function(index) {
		return index + 1;
	},

	getUserName: function(users) {
		var userName = '-';

		users.forEach((user) => {
			if (this.userId == user._id) {
				userName = user.profile.name;
			}
		});

		return userName;
	},

	getWinRate: function() {
		return getWinRate(this);
	}
});

/** @type {RankChart}|null */
var rankChart = null;

Template.rank.events({
	'click [data-action=view-table-display]': function(e) {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.spinner-table-display')) {
			$(rankDisplay).addClass('spinner-table-display');
			$(rankDisplay).removeClass('spinner-line-chart-display');
		}
	},

	'click [data-action=view-line-chart-display]': function(e) {
		const rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.spinner-line-chart-display')) {
			$(rankDisplay).addClass('spinner-line-chart-display');
			$(rankDisplay).removeClass('spinner-table-display');

			//Select the 7 days by default
			$('span[data-action="display-chart-7-days"]').first().trigger('click');
		}
	},

	'click [data-action=display-chart-all-time]': function(e) {
		highlightSelectedChartPeriodItem(e);

		Meteor.subscribe('ranks-chart', 0, () => {
			rankChart.update('Oldest');
		});
	},

	'click [data-action=display-chart-60-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 60);

		highlightSelectedChartPeriodItem(e);

		Meteor.subscribe('ranks-chart', minDate.getTime(), () => {
			rankChart.update('60 days ago', minDate);
		});
	},

	'click [data-action=display-chart-30-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 30);

		highlightSelectedChartPeriodItem(e);

		Meteor.subscribe('ranks-chart', minDate.getTime(), () => {
			rankChart.update('30 days ago', minDate);
		});
	},

	'click [data-action=display-chart-14-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 14);

		highlightSelectedChartPeriodItem(e);

		Meteor.subscribe('ranks-chart', minDate.getTime(), () => {
			rankChart.update('14 days ago', minDate);
		});
	},

	'click [data-action=display-chart-7-days]': function(e) {
		const minDate = new Date();
		minDate.setDate(minDate.getDate() - 7);

		highlightSelectedChartPeriodItem(e);

		Meteor.subscribe('ranks-chart', minDate.getTime(), () => {
			rankChart.update('7 days ago', minDate);
		});
	}
});

var highlightSelectedChartPeriodItem = function(e) {
	var parent = $(e.target).parents('.display-chart-period')[0],
		displayChartPeriodItems = $(parent).find('span');

	displayChartPeriodItems.each(function(index, field) {
		$(field).removeClass('active');
	});

	$(e.target).addClass('active');
};

Template.rank.rendered = function() {
	rankChart = new RankChart(
		'rank-line-chart',
		EloScores.find({}, {sort: ['timestamp']}),
		Meteor.users.find({}, {sort: ['profile.name']}),
		Profiles.find(),
		Meteor.userId()
	);
};

Template.rank.destroyed = function() {
	rankChart = null;
};
