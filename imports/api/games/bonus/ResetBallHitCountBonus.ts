import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class ResetBallHitCountBonus extends BaseBonus {
	atlasFrame: string = 'reset-ball-hit-count';
	description: string = 'Resets and stops ball hit count for 5s';
	durationMilliseconds: number = 5000;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ResetBallHitCountBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.stopBallHitCount.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.restartBallHitCount.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}
};
