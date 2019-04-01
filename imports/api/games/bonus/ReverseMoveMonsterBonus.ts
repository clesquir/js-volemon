import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/component/Bonuses';
import BaseBonus from "./BaseBonus";

export default class ReverseMoveMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'reverse-move-monster';
	description: string = 'Reverses player movements';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ReverseMoveMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.applyReversePlayerMove.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetReversePlayerMove.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
