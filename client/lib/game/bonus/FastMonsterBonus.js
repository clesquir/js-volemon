import MovementMonsterBonus from '/client/lib/game/bonus/MovementMonsterBonus.js';
import { Config } from '/lib/config.js';

export default class FastMonsterBonus extends MovementMonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf0e7';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove * 2);
	}

};
