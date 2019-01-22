import JumpMonsterBonus from './JumpMonsterBonus';
import Bonuses from '../client/components/Bonuses';

export default class NoJumpMonsterBonus extends JumpMonsterBonus {
	atlasFrame: string = 'no-jump-monster';
	description: string = 'Restricts player to jump';

	start(bonuses: Bonuses) {
		bonuses.applyNoJumpPlayer.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetNoJumpPlayer.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
