import {Players} from '/imports/api/games/players.js';
import {Games} from '/imports/api/games/games.js';
import {GAME_STATUS_FINISHED} from '/imports/api/games/statusConstants.js';

export default class TotalPlayingTime {
	static get(userId) {
		const players = Players.find({userId: userId});
		const gamesIds = [];

		players.forEach((player) => {
			gamesIds.push(player.gameId);
		});

		const games = Games.find(
			{
				_id: {$in: gamesIds},
				status: GAME_STATUS_FINISHED,
				gameDuration: {$exists: true}
			},
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
		console.log(totalPlayingTime);
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
