import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class CloakedMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'cloaked-monster';
	description: string = 'Hides from opposite player';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof CloakedMonsterBonus && bonus.getTargetPlayerKey() === this.getTargetPlayerKey();
	}

	start(bonuses: Bonuses) {
		bonuses.hideFromOpponent.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.showToOpponent.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
