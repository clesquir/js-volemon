import MonsterScaleBonus from '/imports/game/bonus/MonsterScaleBonus.js';
import {BIG_SCALE_BONUS, PLAYER_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigMonsterBonus extends MonsterScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf065';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, BIG_SCALE_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_BIG_GRAVITY_SCALE);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'activeGravity', PLAYER_BIG_GRAVITY_SCALE);
	}

};
