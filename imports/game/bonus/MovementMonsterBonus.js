import {PLAYER_VELOCITY_X_ON_MOVE} from '/imports/api/games/constants.js';
import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class MovementMonsterBonus extends MonsterBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof MovementMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', PLAYER_VELOCITY_X_ON_MOVE);

		this.deactivate();
	}

};
