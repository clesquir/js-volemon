import {PLAYER_VELOCITY_X_ON_MOVE} from '/imports/api/games/constants.js';
import MovementMonsterBonus from '/imports/api/games/bonus/MovementMonsterBonus.js';

export default class SlowMonsterBonus extends MovementMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'slow-monster.png';
		this.description = 'Slows down player';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', PLAYER_VELOCITY_X_ON_MOVE / 2.5);
	}
};
