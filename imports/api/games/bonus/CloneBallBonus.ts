import BallBonus from "./BallBonus";
import Bonuses from "../client/component/Bonuses";
import BaseBonus from "./BaseBonus";

export default class CloneBallBonus extends BallBonus {
	atlasFrame: string = 'clone-ball';
	description: string = 'Clone ball';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof CloneBallBonus;
	}

	start(bonuses: Bonuses) {
		bonuses.cloneBall.call(bonuses);
	}

	canOverrideDuration(): boolean {
		return false;
	}
};
