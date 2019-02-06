import MovementMonsterBonus from './MovementMonsterBonus';
import Bonuses from '../client/component/Bonuses';

export default class SlowMonsterBonus extends MovementMonsterBonus {
	atlasFrame: string = 'slow-monster';
	description: string = 'Slows down player';

	start(bonuses: Bonuses) {
		bonuses.applySlowHorizontalMoveMultiplier.call(bonuses, this.activatorPlayerKey);
	}
};
