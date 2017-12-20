import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class RandomBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'random';
		this.description = 'Random bonus';
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

	bonusToActivate() {
		return this.randomBonus;
	}
};
