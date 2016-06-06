export default class RankChart {

	constructor(documentElementId, eloScores, users, currentUser) {
		this.documentElementId = documentElementId;
		this.eloScores = eloScores;
		this.users = users;
		this.currentUser = currentUser;

		this.chart = null;
	}

	update(minDateLabel, minDate) {
		var eloScores = this.eloScores,
			users = this.users,
			usersList = [],
			labels = [],
			timestamps = [],
			datasets = [];

		eloScores.forEach(function(eloScore) {
			if (!minDate || eloScore.timestamp >= minDate.getTime()) {
				labels.push(new Date(eloScore.timestamp).toISOString());
				timestamps.push(eloScore.timestamp);
			}
		});

		labels = Array.from(new Set(labels));
		labels.sort();

		//Clear all labels between first and last
		labels[0] = minDateLabel;
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
			if (user._id == this.currentUser) {
				usersList.unshift(user);
			} else {
				usersList.push(user);
			}
		});

		for (let i = 0; i < usersList.length; i++) {
			let user = usersList[i];
			let data = [];
			let timestampData = null;
			let hasData = false;

			/**
			 * Gather data for player
			 */
			for (let timestamp of timestamps) {
				eloScores.forEach(function(eloScore) {
					if (
						eloScore.userId == user._id &&
						(
							(!hasData && eloScore.timestamp < timestamp) ||
							(eloScore.timestamp == timestamp)
						)
					) {
						timestampData = eloScore.eloRating;
						hasData = true;
					}
				});
				data.push(timestampData);
			}

			if (hasData) {
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
		}

		if (!this.chart) {
			this.chart = new Chart(document.getElementById(this.documentElementId), {
				type: 'line',
				data: {
					labels: labels,
					datasets: datasets
				},
				options: {
					responsive: true,
					elements: {
						point: {
							radius: 0
						}
					},
					legend: {
						position: 'bottom'
					}
				}
			});
		} else {
			this.chart.data.datasets = datasets;
			this.chart.config.data.labels = labels;

			this.chart.update();
		}
	}

}
