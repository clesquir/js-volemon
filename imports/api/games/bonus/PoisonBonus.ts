import CureBonus from './CureBonus';
import MonsterBonus from './MonsterBonus';
import BaseBonus from "./BaseBonus";
import Bonuses from "../client/components/Bonuses";

export default class PoisonBonus extends MonsterBonus {
	atlasFrame: string = 'poison';
	description: string = '10s before death';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		if (bonus instanceof CureBonus && playerKey === this.activatorPlayerKey) {
			if (bonus.hasClearedMostRecentPoison) {
				return false;
			} else {
				bonus.hasClearedMostRecentPoison = true;
				return true;
			}
		}

		return false;
	}

	stop(bonuses: Bonuses) {
		if (!bonuses.isPlayerInvincible.call(bonuses, this.activatorPlayerKey)) {
			bonuses.killPlayer.call(bonuses, this.activatorPlayerKey);
		}

		this.deactivate();
	}
};
