import BallBonus from './BallBonus';
import BaseBonus from "./BaseBonus";
import Bonuses from "../client/component/Bonuses";

export default class BallScaleBonus extends BallBonus {
	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof BallScaleBonus;
	}

	stop(bonuses: Bonuses) {
		bonuses.resetBallScale.call(bonuses);

		this.deactivate();
	}
};
