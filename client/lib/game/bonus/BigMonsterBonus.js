import MonsterScaleBonus from '/client/lib/game/bonus/MonsterScaleBonus.js';
import { Constants } from '/lib/constants.js';

export default class BigMonsterBonus extends MonsterScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf065';
	}

	deactivateFromSimilar(bonus) {
		if (!(bonus instanceof BigMonsterBonus)) {
			this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', true);
		}

		super.deactivateFromSimilar(bonus);
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.BIG_SCALE_BONUS);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', false);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', true);
		super.stop();
	}

};
