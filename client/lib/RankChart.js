export default class RankChart {

	constructor(documentElementId, eloScores, users, profiles, currentUser) {
		this.documentElementId = documentElementId;
		this.eloScores = eloScores;
		this.users = users;
		this.profiles = profiles;
		this.currentUser = currentUser;

		this.chart = null;
	}

	update(minDateLabel, minDate) {
		var eloScores = this.eloScores,
			eloScoresByUsersByTimestamps = {},
			users = this.users,
			profiles = this.profiles,
			usersList = [],
			labels = [],
			timestamps = [],
			datasets = [];

		//Gather eloScores by users and timestamps for faster references
		eloScores.forEach(function(eloScore) {
			if (eloScoresByUsersByTimestamps[eloScore.userId] === undefined) {
				eloScoresByUsersByTimestamps[eloScore.userId] = {};
			}

			if (eloScoresByUsersByTimestamps[eloScore.userId][eloScore.timestamp] === undefined) {
				eloScoresByUsersByTimestamps[eloScore.userId][eloScore.timestamp] = eloScore.eloRating;
			}

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
			let lastTimestampDataNotInPeriod = null;
			let data = [];
			let timestampData = null;
			let hasPeriodData = false;
			let retiredAt = null;

			profiles.forEach(function(profile) {
				if (user._id == profile.userId) {
					retiredAt = profile.retiredAt;
				}
			});

			/**
			 * Gather data for player
			 */
			if (eloScoresByUsersByTimestamps[user._id]) {
				//Get last eloScore before first timestamp of this period
				if (timestamps.length) {
					let firstTimestamp = timestamps[0];

					for (let userTimestamp in eloScoresByUsersByTimestamps[user._id]) {
						if (eloScoresByUsersByTimestamps[user._id].hasOwnProperty(userTimestamp)) {
							let eloRating = eloScoresByUsersByTimestamps[user._id][userTimestamp];

							if (userTimestamp <= firstTimestamp) {
								lastTimestampDataNotInPeriod = eloRating;
							} else {
								break;
							}
						}
					}
				}

				//Get the eloScore for each timestamp in continuum and starting with the lastTimestampDataNotInPeriod
				for (let timestamp of timestamps) {
					if (eloScoresByUsersByTimestamps[user._id][timestamp] !== undefined) {
						timestampData = eloScoresByUsersByTimestamps[user._id][timestamp];
						hasPeriodData = true;
					} else if (timestampData === null) {
						timestampData = lastTimestampDataNotInPeriod;
						hasPeriodData = true;
					} else if (retiredAt && timestamp > retiredAt) {
						timestampData = null;
					}

					data.push(timestampData);
				}
			}

			if (hasPeriodData) {
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
