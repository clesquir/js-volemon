import MovementMonsterBonus from './MovementMonsterBonus';
import Bonuses from '../client/component/Bonuses';

export default class FastMonsterBonus extends MovementMonsterBonus {
	atlasFrame: string = 'fast-monster';
	description: string = 'Speeds up player';

	start(bonuses: Bonuses) {
		bonuses.applyFastHorizontalMoveMultiplier.call(bonuses, this.activatorPlayerKey);
	}
};
