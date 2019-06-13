import BaseBonus from './BaseBonus';
import Bonuses from "../client/component/Bonuses";

export default class ClearBonuses extends BaseBonus {
	atlasFrame: string = 'clear-bonuses';
	description: string = 'Clear bonuses';
	durationMilliseconds: number = 0;

	getTargetPlayerKey(): string {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ClearBonuses;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.clearBonuses.call(bonuses);
	}
};
