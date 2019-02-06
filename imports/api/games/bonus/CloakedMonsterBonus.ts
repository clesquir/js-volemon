import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/component/Bonuses';
import BaseBonus from "./BaseBonus";

export default class CloakedMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'cloaked-monster';
	description: string = 'Hides from opposite player';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof CloakedMonsterBonus && bonus.getTargetPlayerKey() === this.getTargetPlayerKey();
	}

	start(bonuses: Bonuses) {
		bonuses.hidePlayerFromOpponent.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.showPlayerToOpponent.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
