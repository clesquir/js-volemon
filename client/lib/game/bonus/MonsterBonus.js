import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class MonsterBonus extends BaseBonus {

	constructor(game) {
		super(game);
		this.spriteKey = 'bonus-target';
	}

};
