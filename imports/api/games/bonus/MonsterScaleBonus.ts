import MonsterBonus from './MonsterBonus';
import Bonuses from "../client/components/Bonuses";
import BaseBonus from "./BaseBonus";

export default class MonsterScaleBonus extends MonsterBonus {
	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof MonsterScaleBonus && playerKey === this.activatorPlayerKey;
	}

	stop(bonuses: Bonuses) {
		bonuses.resetPlayerScale.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
