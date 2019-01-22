import JumpMonsterBonus from './JumpMonsterBonus';
import Bonuses from '../client/components/Bonuses';

export default class BounceMonsterBonus extends JumpMonsterBonus {
	atlasFrame: string = 'bounce-monster';
	description: string = 'Player jumps constantly';

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'alwaysJump', true);
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canJump', false);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'alwaysJump', false);
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canJump', true);

		this.deactivate();
	}
};
