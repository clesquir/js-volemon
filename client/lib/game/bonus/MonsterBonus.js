import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class MonsterBonus extends BaseBonus {

	constructor(game) {
		super(game);
		this.color = 0xFF0000;
	}

	stop() {
		this.game.resetPlayerScale.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}

};
