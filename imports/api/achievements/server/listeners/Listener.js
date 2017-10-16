import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class Listener {
	constructor() {
		this.userId = null;
	}

	destroy() {
		this.removeListeners();
	}

	addListeners() {
	}

	/**
	 * @param {string} eventName
	 * @param listener
	 */
	addListener(eventName, listener) {
		EventPublisher.on(eventName, listener, this);
	}

	removeListeners() {
	}

	/**
	 * @param {string} eventName
	 * @param listener
	 */
	removeListener(eventName, listener) {
		EventPublisher.off(eventName, listener, this);
	}

	/**
	 * @param {string} achievementId
	 */
	incrementNumber(achievementId) {
		const userAchievement = this.userAchievement(achievementId);

		let number = 1;
		if (userAchievement) {
			number = userAchievement.number + 1;
		}

		this.insertOrUpdateAchievement(userAchievement, achievementId, number);
	}

	/**
	 * @param {string} achievementId
	 * @param {int} number
	 */
	updateNumberIfHigher(achievementId, number) {
		const userAchievement = this.userAchievement(achievementId);

		if (!userAchievement) {
			this.insertOrUpdateAchievement(userAchievement, achievementId, number);
		} else if (number > userAchievement.number) {
			this.insertOrUpdateAchievement(userAchievement, achievementId, number);
		}
	}

	/**
	 * @param {string} achievementId
	 */
	incrementNumberIfHigherWithNumberSinceLastReset(achievementId) {
		if (this.numberSinceLastReset === undefined) {
			this.resetNumberSinceLastReset();
		}
		this.numberSinceLastReset = this.numberSinceLastReset + 1;

		this.updateNumberIfHigher(achievementId, this.numberSinceLastReset);
	}

	resetNumberSinceLastReset() {
		this.numberSinceLastReset = 0;
	}

	/**
	 * @param {string} achievementId
	 */
	initNumberSinceLastReset(achievementId) {
		const userAchievement = this.userAchievement(achievementId);

		this.numberSinceLastReset = 0;
		if (userAchievement) {
			this.numberSinceLastReset = userAchievement.numberSinceLastReset;
		}
	}

	/**
	 * @param {string} achievementId
	 */
	updatetNumberSinceLastReset(achievementId) {
		const userAchievement = this.userAchievement(achievementId);

		if (!userAchievement) {
			this.insertAchievement(achievementId, {numberSinceLastReset: this.numberSinceLastReset});
		} else {
			this.updateAchievement(achievementId, {numberSinceLastReset: this.numberSinceLastReset});
		}
	}

	/**
	 * @protected
	 * @param userAchievement
	 * @param achievementId
	 * @param number
	 */
	insertOrUpdateAchievement(userAchievement, achievementId, number) {
		if (!userAchievement) {
			this.insertAchievement(achievementId, {number: number});
		} else {
			this.updateAchievement(achievementId, {number: number});
		}
	}

	/**
	 * @protected
	 * @param achievementId
	 * @param data
	 */
	insertAchievement(achievementId, data) {
		UserAchievements.insert(
			Object.assign(
				{
					userId: this.userId,
					achievementId: achievementId,
					modifiedAt: getUTCTimeStamp()
				},
				data
			)
		);
	}

	/**
	 * @protected
	 * @param achievementId
	 * @param data
	 */
	updateAchievement(achievementId, data) {
		UserAchievements.update(
			{
				userId: this.userId,
				achievementId: achievementId
			},
			{$set:
				Object.assign(
					{
						modifiedAt: getUTCTimeStamp()
					},
					data
				)
			}
		);
	}

	/**
	 * @protected
	 * @param achievementId
	 * @returns {*}
	 */
	userAchievement(achievementId) {
		return UserAchievements.findOne(
			{
				userId: this.userId,
				achievementId: achievementId
			}
		);
	}
}
