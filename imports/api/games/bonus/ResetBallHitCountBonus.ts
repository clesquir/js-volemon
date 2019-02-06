import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class ResetBallHitCountBonus extends BaseBonus {
	atlasFrame: string = 'reset-ball-hit-count';
	description: string = 'Reset team ball hit count';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ResetBallHitCountBonus;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.resetBallHitCount.call(bonuses, this.activatorPlayerKey);
	}
};
