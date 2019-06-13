import moment from 'moment';
import GameListener from './GameListener';
import {ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/GameFinished.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ConsecutiveDaysPlayed extends GameListener {
	allowedForPracticeGame() {
		return true;
	}

	addListeners() {
		this.addListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	removeListeners() {
		this.removeListener(GameFinished.prototype.constructor.name, this.onGameFinished);
	}

	/**
	 * @param {GameFinished} event
	 */
	onGameFinished(event) {
		if (
			event.gameId === this.gameId &&
			this.userIsGamePlayer()
		) {
			const userAchievement = this.getUserAchievement(ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED);

			if (!userAchievement) {
				this.insertAchievement(
					ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
					{
						number: 1,
						lastDatePlayed: this.todaysDate(),
						numberSinceLastReset: 1
					}
				);
			} else {
				const lastDatePlayed = moment(userAchievement.lastDatePlayed);
				const yesterday = moment(this.yesterdaysDate());

				if (lastDatePlayed.format('YYYY-MM-DD') === yesterday.format('YYYY-MM-DD')) {
					this.increaseConsecutiveDays(userAchievement);
				} else if (lastDatePlayed < yesterday) {
					this.resetConsecutiveDays();
				}
			}
		}
	}

	/**
	 * @returns {int}
	 */
	yesterdaysDate() {
		return moment(this.todaysDate()).subtract(moment.duration({'days': 1})).valueOf();
	}

	/**
	 * @returns {int}
	 */
	todaysDate() {
		return getUTCTimeStamp();
	}

	increaseConsecutiveDays(userAchievement) {
		const dataToUpdate = {
			lastDatePlayed: this.todaysDate(),
			numberSinceLastReset: userAchievement.numberSinceLastReset + 1
		};

		if (dataToUpdate.numberSinceLastReset > userAchievement.number) {
			dataToUpdate.number = dataToUpdate.numberSinceLastReset;
		}

		this.updateAchievement(
			ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
			dataToUpdate
		);
	}

	resetConsecutiveDays() {
		this.updateAchievement(
			ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED,
			{
				lastDatePlayed: this.todaysDate(),
				numberSinceLastReset: 1
			}
		);
	}
}
