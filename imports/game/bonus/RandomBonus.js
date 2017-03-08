import BaseBonus from '/imports/game/bonus/BaseBonus.js';

export default class RandomBonus extends BaseBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment';
		this.letter = '\uf128';
	}

	dataToStream() {
		const data = super.dataToStream();
		data.randomBonusClassName = this.randomBonus.getClassName();
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
