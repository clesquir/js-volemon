import * as Moment from 'meteor/momentjs:moment';
import GameListener from './GameListener.js';
import {ACHIEVEMENT_CONSECUTIVE_DAYS_PLAYED} from '/imports/api/achievements/constants.js';
import GameFinished from '/imports/api/games/events/PlayerWon.js';
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
						consecutiveDays: 1
					}
				);
			} else {
				const lastDatePlayed = Moment.moment(userAchievement.lastDatePlayed);
				const yesterday = Moment.moment(this.yesterdaysDate());

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
		return Moment.moment(this.todaysDate()).subtract(Moment.moment.duration({'days': 1})).valueOf();
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
			consecutiveDays: userAchievement.consecutiveDays + 1
		};

		if (dataToUpdate.consecutiveDays > userAchievement.number) {
			dataToUpdate.number = dataToUpdate.consecutiveDays;
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
				consecutiveDays: 1
			}
		);
	}
}
