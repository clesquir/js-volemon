import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class InvincibilityBonus extends BaseBonus {

	constructor(game) {
		super(game);
		this.color = 0xFFFF00;
		this.letter = 'I';
	}

};
