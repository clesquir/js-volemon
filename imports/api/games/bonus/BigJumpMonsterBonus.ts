import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class BigJumpMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'big-jump-monster';
	description: string = 'Super high player jumps';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof BigJumpMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'verticalMoveMultiplier', 1.35);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'verticalMoveMultiplier', 1);

		this.deactivate();
	}
};
