import { Config } from '/imports/lib/config.js';
import { getUTCTimeStamp } from '/imports/lib/utils.js';

export default class BaseBonus {

	constructor(game, className) {
		this.game = game;
		this.className = className;
		this.durationMilliseconds = Config.bonusDuration;
		this.createdAt = getUTCTimeStamp();
		this.isActive = false;
		this.activatorPlayerKey = null;
		this.activatedAt = null;
		this.spriteBorderKey = 'bonus-environment';
		this.letter = '\uf005';
		this.fontSize = '16px';
	}

	dataToStream() {
		return {
			bonusClassName: this.getClassName(),
			bonusIdentifier: this.getIdentifier()
		};
	}

	getIdentifier() {
		return this.className + '_' + this.createdAt;
	}

	getClassName() {
		return this.className;
	}

	bonusToActivate() {
		return this;
	}

	classNameToActivate() {
		return this.getClassName();
	}

	getSpriteBorderKey() {
		return this.spriteBorderKey;
	}

	getLetter() {
		return this.letter;
	}

	getFontSize() {
		return this.fontSize;
	}

	getActivatedAt() {
		return this.activatedAt;
	}

	getDuration() {
		return this.durationMilliseconds;
	}

	getTargetPlayerKey() {
		return this.activatorPlayerKey;
	}

	/**
	 * Sets the bonus active and keep reference of the activator player and date
	 * @param playerKey
	 */
	activate(playerKey) {
		this.isActive = true;
		this.activatorPlayerKey = playerKey;
		this.activatedAt = getUTCTimeStamp();
	}

	deactivate() {
		this.isActive = false;
	}

	/**
	 * Deactivate the bonus if the duration has elapsed
	 * @returns {boolean} False if this bonus is not active
	 */
	check() {
		if (!this.isActive) {
			return false;
		}

		if (getUTCTimeStamp() - this.activatedAt >= this.durationMilliseconds) {
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

};
