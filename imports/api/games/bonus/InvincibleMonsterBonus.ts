import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class InvincibleMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'invincible-monster';
	description: string = 'Prevents being killed by instant death, poison and ball touching the ground';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof InvincibleMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'isInvincible', true);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'isInvincible', false);

		this.deactivate();
	}
};
