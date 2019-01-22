import InvisibleOpponentMonsterBonus from './InvisibleOpponentMonsterBonus';
import MonsterBonus from './MonsterBonus';
import Bonuses from '../client/components/Bonuses';
import BaseBonus from "./BaseBonus";

export default class InvisibleMonsterBonus extends MonsterBonus {
	atlasFrame: string = 'invisible-monster';
	description: string = 'Invisible player';

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return (
			(bonus instanceof InvisibleMonsterBonus || bonus instanceof InvisibleOpponentMonsterBonus) &&
			bonus.getTargetPlayerKey() === this.getTargetPlayerKey()
		);
	}

	start(bonuses: Bonuses) {
		bonuses.hidePlayerFromHimself.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.showPlayerToHimself.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
