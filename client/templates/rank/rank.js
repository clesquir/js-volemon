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
	}
});

Template.rank.events({
	'click [data-action=view-table-display]': function(e) {
		var rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.spinner-table-display')) {
			$(rankDisplay).addClass('spinner-table-display');
			$(rankDisplay).removeClass('spinner-line-chart-display');
		}
	},

	'click [data-action=view-line-chart-display]': function(e) {
		var rankDisplay = document.getElementById('rank-display');

		if (!$(rankDisplay).is('.spinner-line-chart-display')) {
			$(rankDisplay).addClass('spinner-line-chart-display');
			$(rankDisplay).removeClass('spinner-table-display');

			createRankLineChart();
		}
	}
});

Template.rank.destroyed = function() {
	rankLineChart = undefined;
};

rankLineChart = undefined;
createRankLineChart = function() {
	if (rankLineChart === undefined) {
		var eloScores = EloScores.find(),
			users = Meteor.users.find({}, {sort: ['profile.name']}),
			usersList = [],
			labels = [],
			timestamps = [],
			datasets = [];

		eloScores.forEach(function(eloScore) {
			labels.push(new Date(eloScore.timestamp).toISOString());
			timestamps.push(eloScore.timestamp);
		});

		labels = Array.from(new Set(labels));
		labels.sort();

		//Clear all labels between oldest and most recent
		labels[0] = 'Oldest';
		labels[labels.length - 1] = 'Most recent';
		if (labels.length > 2) {
			for (let i = 1; i < labels.length - 1; i++) {
				labels[i] = '';
			}
		}

		timestamps = Array.from(new Set(timestamps));
		timestamps.sort();

		//Sort the connected user first
		users.forEach(function(user) {
			if (user._id == Meteor.userId()) {
				usersList.unshift(user);
			} else {
				usersList.push(user);
			}
		});

		for (let i = 0; i < usersList.length; i++) {
			let user = usersList[i];
			let data = [];
			let timestampData = null;

			for (let timestamp of timestamps) {
				eloScores.forEach(function(eloScore) {
					if (eloScore.userId == user._id && timestamp == eloScore.timestamp) {
						timestampData = eloScore.eloRating;
					}
				});
				data.push(timestampData);
			}

			let color = getRainbowColor(users.count(), i + 1);

			datasets.push({
				label: user.profile.name,
				borderColor: color,
				fill: false,
				backgroundColor: color,
				tension: 0.2,
				pointHitRadius: 0,
				pointBorderWidth: 0,
				pointHoverRadius: 3,
				pointHoverBorderWidth: 2,
				pointHoverBackgroundColor: color,
				pointHoverBorderColor: 'rgba(100, 100, 100, 0.25)',
				data: data
			});
		}

		rankLineChart = new Chart(document.getElementById('rank-line-chart'), {
			type: 'line',
			data: {
				labels: labels,
				datasets: datasets
			},
			options: {
				responsive: true,
				elements: {
					point: {
						radius: 1
					}
				},
				legend: {
					position: 'bottom'
				}
			}
		});
	}
};
