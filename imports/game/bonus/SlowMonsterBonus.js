import MovementMonsterBonus from '/imports/game/bonus/MovementMonsterBonus.js';
import { Config } from '/imports/lib/config.js';

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
