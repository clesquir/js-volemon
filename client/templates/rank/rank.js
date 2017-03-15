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
		let userName = '-';

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
let rankChart = null;

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

const updateRankChart = function(e, minDateLabel, minDate) {
	highlightSelectedChartPeriodItem(e);

	let minDateTime = 0;
	if (minDate) {
		minDateTime = minDate.getTime();
	}

	Session.set('loadingmask', true);

	Meteor.subscribe('ranks-chart', minDateTime, () => {
		rankChart.update(minDateLabel, minDate);
		Session.set('loadingmask', false);
	});
};

const highlightSelectedChartPeriodItem = function(e) {
	const parent = $(e.target).parents('.display-chart-period')[0];
	const displayChartPeriodItems = $(parent).find('span');

	displayChartPeriodItems.each(function(index, field) {
		$(field).removeClass('active');
	});

	$(e.target).addClass('active');
};

Template.rank.rendered = function() {
	rankChart = new RankChart(
		'rank-line-chart-canvas',
		EloScores.find({}, {sort: ['timestamp']}),
		Meteor.users.find({}, {sort: ['profile.name']}),
		Profiles.find(),
		Meteor.userId()
	);
};

Template.rank.destroyed = function() {
	rankChart = null;
};
