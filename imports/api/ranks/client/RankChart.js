import Chart from "chart.js";
import {getRainbowColor} from '/imports/lib/utils.js';

export default class RankChart {
	constructor(documentElementId, rankChartData) {
		this.documentElementId = documentElementId;
		this.rankChartData = rankChartData;
		this.chart = null;
	}

	update(minDateLabel, minDate) {
		const rankChartData = this.rankChartData;
		const usernamesByUserId = {};
		const eloScoresByUsersByTimestamps = {};
		let labels = [];
		let timestamps = [];
		const datasets = [];

		//Gather rankChartData by userId and timestamps for faster references
		rankChartData.forEach(function(rankChartData) {
			if (!minDate || rankChartData.timestamp >= minDate.getTime()) {
				const userId = rankChartData.userId;

				if (usernamesByUserId[userId] === undefined) {
					usernamesByUserId[userId] = rankChartData.username;
				}

				if (eloScoresByUsersByTimestamps[userId] === undefined) {
					eloScoresByUsersByTimestamps[userId] = {};
				}

				if (eloScoresByUsersByTimestamps[userId][rankChartData.timestamp] === undefined) {
					eloScoresByUsersByTimestamps[userId][rankChartData.timestamp] = rankChartData.eloRating;
				}

				labels.push(new Date(rankChartData.timestamp).toISOString());
				timestamps.push(rankChartData.timestamp);
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

		let userCounter = 0;
		for (let userId in usernamesByUserId) {
			let lastTimestampDataNotInPeriod = null;
			let data = [];
			let timestampData = null;
			let hasPeriodData = false;

			/**
			 * Gather data for player
			 */
			if (eloScoresByUsersByTimestamps[userId]) {
				//Get last eloScore before first timestamp of this period
				if (timestamps.length) {
					let firstTimestamp = timestamps[0];

					for (let userTimestamp in eloScoresByUsersByTimestamps[userId]) {
						if (eloScoresByUsersByTimestamps[userId].hasOwnProperty(userTimestamp)) {
							let eloRating = eloScoresByUsersByTimestamps[userId][userTimestamp];

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
					if (eloScoresByUsersByTimestamps[userId][timestamp] !== undefined) {
						timestampData = eloScoresByUsersByTimestamps[userId][timestamp];
						hasPeriodData = true;
					} else if (timestampData === null) {
						timestampData = lastTimestampDataNotInPeriod;
						hasPeriodData = true;
					}

					data.push(timestampData);
				}
			}

			if (hasPeriodData) {
				let color = getRainbowColor(Object.keys(usernamesByUserId).length, userCounter++);

				datasets.push({
					label: usernamesByUserId[userId],
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
