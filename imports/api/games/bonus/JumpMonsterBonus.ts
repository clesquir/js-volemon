import MonsterBonus from './MonsterBonus';
import BaseBonus from "./BaseBonus";

export default class JumpMonsterBonus extends MonsterBonus {
	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof JumpMonsterBonus && playerKey === this.activatorPlayerKey;
	}
};
