import MonsterScaleBonus from '/imports/game/bonus/MonsterScaleBonus.js';
import { Constants } from '/imports/lib/constants.js';

export default class SmallMonsterBonus extends MonsterScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf066';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, Constants.SMALL_SCALE_PLAYER_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, Constants.PLAYER_SMALL_GRAVITY_SCALE);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'activeGravity', Constants.PLAYER_SMALL_GRAVITY_SCALE);
	}

};
