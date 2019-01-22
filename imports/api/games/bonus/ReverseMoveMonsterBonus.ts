import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class ReverseMoveMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'reverse-move-monster';
	description: string = 'Reverses player movements';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ReverseMoveMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'isMoveReversed', true);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'isMoveReversed', false);

		this.deactivate();
	}
};
