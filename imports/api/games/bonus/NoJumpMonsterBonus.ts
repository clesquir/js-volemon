import JumpMonsterBonus from './JumpMonsterBonus';
import Bonuses from '../client/components/Bonuses';

export default class NoJumpMonsterBonus extends JumpMonsterBonus {
	atlasFrame: string = 'no-jump-monster';
	description: string = 'Restricts player to jump';

	start(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canJump', false);
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'alwaysJump', false);
	}

	stop(bonuses: Bonuses) {
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'canJump', true);
		bonuses.changePlayerProperty.call(bonuses, this.activatorPlayerKey, 'alwaysJump', false);

		this.deactivate();
	}
};
