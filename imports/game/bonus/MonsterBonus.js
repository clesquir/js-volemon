import BaseBonus from '/imports/game/bonus/BaseBonus.js';

export default class MonsterBonus extends BaseBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target';
	}

};
