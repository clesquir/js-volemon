import MonsterScaleBonus from '/imports/api/games/bonus/MonsterScaleBonus.js';
import {PLAYER_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigMonsterBonus extends MonsterScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'big-monster';
		this.description = 'Big player with high gravity';
	}

	start() {
		this.game.scaleBigPlayer.call(this.game, this.activatorPlayerKey);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_BIG_GRAVITY_SCALE);
	}
};
