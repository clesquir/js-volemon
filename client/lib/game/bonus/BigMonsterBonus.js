import MonsterScaleBonus from '/client/lib/game/bonus/MonsterScaleBonus.js';
import { Constants } from '/lib/constants.js';

export default class BigMonsterBonus extends MonsterScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf065';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.BIG_SCALE_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, Constants.PLAYER_BIG_GRAVITY_SCALE);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'activeGravity', Constants.PLAYER_BIG_GRAVITY_SCALE);
	}

};
