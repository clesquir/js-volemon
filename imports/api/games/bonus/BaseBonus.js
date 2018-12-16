import {BONUS_DURATION} from '/imports/api/games/emissionConstants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class BaseBonus {
	/**
	 * @param {GameBonus} game
	 * @param {string} className
	 */
	constructor(game, className) {
		this.game = game;
		this.className = className;
		this.durationMilliseconds = BONUS_DURATION;
		this.createdAt = getUTCTimeStamp();
		this.isActive = false;
		this.activatorPlayerKey = null;
		this.activatedAt = null;
		this.atlasFrame = '';
		this.description = '';

		this.init();
	}

	init() {
	}

	dataToStream() {
		return {
			bonusClass: this.getClassName(),
			bonusIdentifier: this.getIdentifier(),
			createdAt: this.createdAt
		};
	}

	getIdentifier() {
		return this.className + '_' + this.createdAt;
	}

	activationIdentifier() {
		return this.className + '_' + this.activatorPlayerKey + '_' + this.activatedAt;
	}

	getClassName() {
		return this.className;
	}

	hasRandomBonus() {
		return false;
	}

	bonusToActivate() {
		return this;
	}

	classNameToActivate() {
		return this.getClassName();
	}

	getActivatedAt() {
		return this.activatedAt;
	}

	getDuration() {
		return this.durationMilliseconds;
	}

	canOverrideDuration() {
		return true;
	}

	getActivatorPlayerKey() {
		return this.activatorPlayerKey;
	}

	getTargetPlayerKey() {
		return this.activatorPlayerKey;
	}

	canActivate() {
		if (this.bonusToActivate() !== this) {
			return this.bonusToActivate().canActivate();
		}

		return true;
	}

	beforeActivation(payload) {
		if (this.bonusToActivate() !== this) {
			this.bonusToActivate().beforeActivation(payload);
		}
	}

	beforeActivationData() {
		if (this.bonusToActivate() !== this) {
			return this.bonusToActivate().beforeActivationData();
		}

		return {};
	}

	reassignBeforeActivationData(beforeActivationData) {
	}

	/**
	 * Sets the bonus active and keep reference of the activator player and date
	 * @param {string} playerKey
	 * @param {int} activatedAt
	 */
	activate(playerKey, activatedAt) {
		this.isActive = true;
		this.activatorPlayerKey = playerKey;
		this.activatedAt = activatedAt;
	}

	/**
	 * @returns {Object}
	 */
	activationData() {
		return {
			bonusIdentifier: this.getIdentifier(),
			activatedBonusClass: this.classNameToActivate(),
			targetPlayerKey: this.getTargetPlayerKey(),
			bonusClass: this.getClassName(),
			activatorPlayerKey: this.getActivatorPlayerKey(),
			beforeActivationData: this.beforeActivationData()
		};
	}

	deactivate() {
		this.isActive = false;
	}

	/**
	 * Deactivate the bonus if the duration has elapsed
	 * @param {int} currentTimestamp
	 * @returns {boolean} False if this bonus is not active
	 */
	check(currentTimestamp) {
		if (!this.isActive) {
			return false;
		}

		if (currentTimestamp - this.activatedAt >= this.durationMilliseconds) {
			this.stop();
			return false;
		}

		return true;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return false;
	}

	/**
	 * Starts bonus
	 */
	start() {
	}

	/**
	 * Stops bonus and resets to initial state
	 */
	stop() {
		this.deactivate();
	}

	shouldBeRemovedWhenKilling() {
		return true;
	}
};
