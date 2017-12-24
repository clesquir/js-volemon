import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import {BIG_SCALE_BONUS, PLAYER_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class JunkFoodMonsterBonus extends BigMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'junk-food-monster';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, BIG_SCALE_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_BIG_GRAVITY_SCALE);
	}
};
