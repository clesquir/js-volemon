import BaseBonus from './BaseBonus';
import Bonuses from "../client/components/Bonuses";

export default class CloudBonus extends BaseBonus {
	atlasFrame: string = 'cloud';
	description: string = 'Cloud';
	durationMilliseconds: number = 30000;

	getTargetPlayerKey(): string {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof CloudBonus;
	}

	start(bonuses: Bonuses) {
		bonuses.drawCloud.call(bonuses);
	}

	stop(bonuses: Bonuses) {
		bonuses.hideCloud.call(bonuses);

		this.deactivate();
	}
};
