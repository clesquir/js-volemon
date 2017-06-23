import {UserAchievements} from '/imports/api/achievements/userAchievements.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';
import {EventPublisher} from '/imports/lib/EventPublisher.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class Listener {
	/**
	 * @param {string} gameId
	 * @param {string} userId
	 */
	constructor(gameId, userId) {
		this.gameId = gameId;
		this.userId = userId;

		this.addListeners();
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
	 * @param {integer} number
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
	 * @returns {boolean}
	 */
	userIsGamePlayer() {
		return !!Players.findOne({gameId: this.gameId, userId: this.userId});
	}

	/**
	 * @returns {string|null}
	 */
	userPlayerKey() {
		const game = Games.findOne({_id: this.gameId});

		let userPlayerKey = null;
		if (game) {
			if (game.createdBy === this.userId) {
				userPlayerKey = 'player1';
			} else if (this.userIsGamePlayer()) {
				userPlayerKey = 'player2';
			}
		}

		return userPlayerKey;
	}

	currentPlayerShape() {
		const player = Players.findOne({gameId: this.gameId, userId: this.userId});

		if (player) {
			return player.shape;
		}

		return null;
	}

	oppositePlayerShape() {
		const player = Players.findOne({gameId: this.gameId, userId: {$ne: this.userId}});

		if (player) {
			return player.shape;
		}

		return null;
	}

	/**
	 * @param {string} playerKey
	 * @returns {boolean}
	 */
	playerKeyIsUser(playerKey) {
		return playerKey === this.userPlayerKey();
	}

	/**
	 * @param {string} playerKey
	 * @returns {boolean}
	 */
	playerKeyIsOpponent(playerKey) {
		const userPlayerKey = this.userPlayerKey();

		return userPlayerKey !== null && playerKey !== userPlayerKey;
	}

	/**
	 * @returns {boolean}
	 */
	playerIsHost() {
		return 'player1' === this.userPlayerKey();
	}

	/**
	 * @returns {boolean}
	 */
	playerIsClient() {
		return 'player2' === this.userPlayerKey();
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
