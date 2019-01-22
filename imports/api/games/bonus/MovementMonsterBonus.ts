import MonsterBonus from './MonsterBonus';
import Bonuses from "../client/components/Bonuses";
import BaseBonus from "./BaseBonus";

export default class MovementMonsterBonus extends MonsterBonus {
	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof MovementMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	stop(bonuses: Bonuses) {
		bonuses.resetHorizontalMoveMultiplier.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
