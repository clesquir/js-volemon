import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';
import {BONUS_INSTANT_DEATH, BONUS_INVINCIBLE_MONSTER} from '/imports/api/games/bonusConstants.js';
import BonusFactory from '/imports/api/games/BonusFactory.js';
import {Random} from 'meteor/random';

export default class InvincibleInstantDeathBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'invincible-instant-death';
		this.description = 'Invincible or Instant death';
	}

	init() {
		this.setRandomBonus(
			BonusFactory.fromClassName(
				Random.choice(
					[
						BONUS_INVINCIBLE_MONSTER,
						BONUS_INSTANT_DEATH,
					]
				),
				this.game
			)
		);
	}

	dataToStream() {
		const data = super.dataToStream();
		data.randomBonusClass = this.randomBonus.getClassName();
		return data;
	}

	getIdentifier() {
		return super.getIdentifier() + '_' + this.randomBonus.getIdentifier();
	}

	setRandomBonus(randomBonus) {
		this.randomBonus = randomBonus;
	}

	hasRandomBonus() {
		return true;
	}

	bonusToActivate() {
		return this.randomBonus;
	}
};
