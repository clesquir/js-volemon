import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class MonsterBonus extends BaseBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target';
	}

};
