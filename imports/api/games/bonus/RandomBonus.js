import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class RandomBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'random';
		this.description = 'Random bonus';
	}

	dataToStream() {
		const data = super.dataToStream();
		data.randomBonusClass = this.getRandomBonus().getClassName();
		return data;
	}

	getIdentifier() {
		return super.getIdentifier() + '_' + this.getRandomBonus().getIdentifier();
	}

	setRandomBonus(randomBonus) {
		this.randomBonus = randomBonus;
	}

	getRandomBonus() {
		let randomBonus = this.randomBonus;

		if (randomBonus.hasRandomBonus()) {
			randomBonus = randomBonus.randomBonus;
		}

		return randomBonus;
	}

	hasRandomBonus() {
		return true;
	}

	bonusToActivate() {
		return this.getRandomBonus();
	}
};
