import BallBonus from './BallBonus';
import Bonuses from '../client/component/Bonuses';
import BaseBonus from "./BaseBonus";

export default class InvisibleBallBonus extends BallBonus {
	atlasFrame: string = 'invisible-ball';
	description: string = 'Invisible ball';
	durationMilliseconds: number = 2000;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof InvisibleBallBonus;
	}

	start(bonuses: Bonuses) {
		bonuses.hideBall.call(bonuses);
	}

	stop(bonuses: Bonuses) {
		bonuses.unhideBall.call(bonuses);

		this.deactivate();
	}
};
