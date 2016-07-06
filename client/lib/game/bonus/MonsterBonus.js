import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class MonsterBonus extends BaseBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target';
	}

};
