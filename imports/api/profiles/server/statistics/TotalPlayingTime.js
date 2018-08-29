import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

export default class TotalPlayingTime {
	static get(userId, tournamentId) {
		const query = {
			'players.id': userId,
			status: GAME_STATUS_FINISHED,
			gameDuration: {$exists: true}
		};

		if (tournamentId) {
			query.tournamentId = tournamentId;
		}

		const games = Games.find(
			query,
			{
				sort: [['createdAt', 'asc']]
			}
		);

		let firstGame = null;
		let lastGame = null;
		let totalPlayingTime = 0;
		games.forEach((game) => {
			if (firstGame === null) {
				firstGame = game.createdAt;
			}
			lastGame = game.createdAt;
			totalPlayingTime += game.gameDuration;
		});

		return {
			firstGame: firstGame,
			lastGame: lastGame,
			totalPlayingTime: this.totalPlayingTime(totalPlayingTime)
		};
	}

	/**
	 * @private
	 * @param totalPlayingTime
	 * @returns {String}
	 */
	static totalPlayingTime(totalPlayingTime) {
		let seconds = Math.floor(totalPlayingTime / 1000);
		let minutes = Math.floor(seconds / 60);
		let hours = Math.floor(minutes / 60);
		let days = Math.floor(hours / 24);
		let weeks = Math.floor(days / 7);

		if (seconds === 0) {
			return '-';
		} else if (minutes === 0) {
			return seconds + 's';
		} else if (hours === 0) {
			return minutes + 'm';
		} else if (days === 0) {
			minutes -= Math.floor(hours * 60);
			return hours + 'h ' + minutes + 'm';
		} else if (weeks === 0) {
			hours -= Math.floor(days * 24);
			let difference = days + 'd';

			if (days > 0) {
				difference = difference + ' ' + hours + 'h';
			}

			return difference;
		} else {
			days -= Math.floor(weeks * 7);
			let difference = weeks + 'w';

			if (days > 0) {
				difference = difference + ' ' + days + 'd';
			}

			return difference;
		}
	}
}
