import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class BonusRepellentMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'bonus-repellent';
	description: string = 'Bonus repellent';
	durationMilliseconds: number = 30000;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof BonusRepellentMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canActivateBonuses', false);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canActivateBonuses', true);

		this.deactivate();
	}
};
