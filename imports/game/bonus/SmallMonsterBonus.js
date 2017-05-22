import MonsterScaleBonus from '/imports/game/bonus/MonsterScaleBonus.js';
import {SMALL_SCALE_PLAYER_BONUS, PLAYER_SMALL_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class SmallMonsterBonus extends MonsterScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf066';
	}

	start() {
		this.game.scalePlayer.call(this.game, this.activatorPlayerKey, SMALL_SCALE_PLAYER_BONUS);
		this.game.setPlayerGravity.call(this.game, this.activatorPlayerKey, PLAYER_SMALL_GRAVITY_SCALE);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'activeGravity', PLAYER_SMALL_GRAVITY_SCALE);
	}

};
