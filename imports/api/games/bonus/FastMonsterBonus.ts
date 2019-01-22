import MovementMonsterBonus from './MovementMonsterBonus';
import Bonuses from '../client/components/Bonuses';

export default class FastMonsterBonus extends MovementMonsterBonus {
	atlasFrame: string = 'fast-monster';
	description: string = 'Speeds up player';

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'horizontalMoveMultiplier', 2);
	}
};
