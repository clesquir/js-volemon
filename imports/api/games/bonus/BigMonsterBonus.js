import MonsterScaleBonus from '/imports/api/games/bonus/MonsterScaleBonus.js';
import {BIG_SCALE_BONUS, PLAYER_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigMonsterBonus extends MonsterScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'big-monster.png';
		this.description = 'Big player with high gravity';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, BIG_SCALE_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_BIG_GRAVITY_SCALE);
	}
};
