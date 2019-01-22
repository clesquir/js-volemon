import MonsterBonus from './MonsterBonus';
import UnfreezeMonsterBonus from './UnfreezeMonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class FreezeMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'freeze-monster';
	description: string = 'Freezes the player';
	durationMilliseconds: number = 5000;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return (
			(bonus instanceof FreezeMonsterBonus || bonus instanceof UnfreezeMonsterBonus) &&
			playerKey === this.activatorPlayerKey
		);
	}

	start(bonuses: Bonuses) {
		bonuses.freezePlayer.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.unfreezePlayer.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
