import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/component/Bonuses';
import BaseBonus from "./BaseBonus";

export default class InvincibleMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'invincible-monster';
	description: string = 'Prevents being killed by instant death, poison and ball touching the ground';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof InvincibleMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.applyInvinciblePlayer.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetInvinciblePlayer.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
