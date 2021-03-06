import FreezeMonsterBonus from './FreezeMonsterBonus';
import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/component/Bonuses';
import BaseBonus from "./BaseBonus";

export default class UnfreezeMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'unfreeze-monster';
	description: string = 'Unfreezes the player (only available in tournament)';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof FreezeMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.unfreezePlayer.call(bonuses, this.activatorPlayerKey);
	}
};
