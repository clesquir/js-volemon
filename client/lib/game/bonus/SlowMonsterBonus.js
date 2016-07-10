import MovementMonsterBonus from '/client/lib/game/bonus/MovementMonsterBonus.js';
import { Config } from '/lib/config.js';

export default class SlowMonsterBonus extends MovementMonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf252';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove / 2.5);
	}

};
