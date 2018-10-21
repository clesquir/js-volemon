import MonsterScaleBonus from '/imports/api/games/bonus/MonsterScaleBonus.js';
import {PLAYER_SMALL_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class SmallMonsterBonus extends MonsterScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'small-monster';
		this.description = 'Small player with low gravity';
	}

	start() {
		this.game.scaleSmallPlayer.call(this.game, this.activatorPlayerKey);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_SMALL_GRAVITY_SCALE);
	}
};
