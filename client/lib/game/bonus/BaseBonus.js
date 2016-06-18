export default class BaseBonus {

	constructor(game) {
		this.game = game;
		this.durationMilliseconds = Config.bonusDuration;
		this.isActive = false;
		this.activatorPlayerKey = null;
		this.activatedAt = null;
		this.spriteBorderKey = 'bonus-environment';
		this.letter = '\uf005';
		this.fontSize = '16px';
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

	/**
	 * Sets the bonus active and keep reference of the activator player and date
	 * @param playerKey
	 */
	activate(playerKey) {
		this.isActive = true;
		this.activatorPlayerKey = playerKey;
		this.activatedAt = getUTCNow();
	}

	deactivateFromSimilar(bonus) {
		this.deactivate();
	}

	deactivate() {
		this.isActive = false;
	}

	getIsActive() {
		return this.isActive;
	}

	/**
	 * Deactivate the bonus if the duration has elapsed
	 * @returns {boolean} False if this bonus is not active
	 */
	check() {
		if (!this.isActive) {
			return false;
		}

		if (getUTCTimeStamp() - this.activatedAt.getTime() >= this.durationMilliseconds) {
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
