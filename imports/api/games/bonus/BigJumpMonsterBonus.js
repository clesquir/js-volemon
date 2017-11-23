import {PLAYER_VELOCITY_Y_ON_JUMP} from '/imports/api/games/constants.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class BigJumpMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf093';
		this.description = 'Super high player jumps';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BigJumpMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', PLAYER_VELOCITY_Y_ON_JUMP * 1.35);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', PLAYER_VELOCITY_Y_ON_JUMP);

		this.deactivate();
	}

};
