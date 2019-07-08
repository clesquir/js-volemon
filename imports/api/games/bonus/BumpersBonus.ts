import BaseBonus from './BaseBonus';
import Bonuses from "../client/component/Bonuses";

export default class BumpersBonus extends BaseBonus {
	atlasFrame: string = 'bumpers';
	description: string = 'Pinball bumpers';
	durationMilliseconds: number = 30000;

	getTargetPlayerKey(): string {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof BumpersBonus;
	}

	start(bonuses: Bonuses) {
		bonuses.enableBumpers.call(bonuses);
	}

	stop(bonuses: Bonuses) {
		bonuses.disableBumpers.call(bonuses);

		this.deactivate();
	}
};
