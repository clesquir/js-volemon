import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';
import { Config } from '/lib/config.js';

export default class BigJumpMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf093';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BigJumpMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', Config.playerVelocityYOnJump * 1.35);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', Config.playerVelocityYOnJump);

		this.deactivate();
	}

};
