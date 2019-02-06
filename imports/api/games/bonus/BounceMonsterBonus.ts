import JumpMonsterBonus from './JumpMonsterBonus';
import Bonuses from '../client/component/Bonuses';

export default class BounceMonsterBonus extends JumpMonsterBonus {
	atlasFrame: string = 'bounce-monster';
	description: string = 'Player jumps constantly';

	start(bonuses: Bonuses) {
		bonuses.applyBouncePlayer.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetBouncePlayer.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
