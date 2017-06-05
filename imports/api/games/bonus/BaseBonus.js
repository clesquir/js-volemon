import {BONUS_RADIUS} from '/imports/api/games/constants.js';
import {BONUS_DURATION} from '/imports/api/games/emissionConstants.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class BaseBonus {
	constructor(game, className) {
		this.game = game;
		this.className = className;
		this.durationMilliseconds = BONUS_DURATION;
		this.createdAt = getUTCTimeStamp();
		this.isActive = false;
		this.activatorPlayerKey = null;
		this.activatedAt = null;
		this.spriteBorderKey = 'bonus-environment';
		this.fontSize = '16px';
		this.letter = undefined;
		this.bonusIconsIndex = undefined;
	}

	dataToStream() {
		return {
			bonusClass: this.getClassName(),
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

	getActivatedAt() {
		return this.activatedAt;
	}

	getDuration() {
		return this.durationMilliseconds;
	}

	getActivatorPlayerKey() {
		return this.activatorPlayerKey;
	}

	getTargetPlayerKey() {
		return this.activatorPlayerKey;
	}

	itemsToDraw(engine) {
		return []
			.concat(this.backgroundToDraw(engine))
			.concat(this.contentToDraw(engine))
			.concat(this.borderToDraw(engine));
	}

	backgroundToDraw(engine) {
		return [engine.drawCircle(0, 0, null, {color: 0xFFFFFF}, BONUS_RADIUS * 2 - 2)];
	}

	contentToDraw(engine) {
		let items = [];

		if (this.letter !== undefined) {
			items.push(
				engine.addText(0, 3, this.letter, {
					font: 'FontAwesome',
					fontWeight: 'normal',
					fontSize: this.fontSize,
					fill: '#363636',
					align: 'center'
				})
			);
		} else if (this.bonusIconsIndex !== undefined) {
			const bonus = engine.addSprite(
				0,
				0,
				'bonus-icons',
				this.bonusIconsIndex,
				undefined,
				true
			);
			engine.setAnchor(bonus, 0.5);
			items.push(bonus);
		}

		return items;
	}

	borderToDraw(engine) {
		const bonusBorder = engine.addSprite(0, 0, this.spriteBorderKey, undefined, undefined, true);
		engine.setAnchor(bonusBorder, 0.5);

		return [bonusBorder];
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
};
