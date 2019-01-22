import GravityBonus from './GravityBonus';
import Bonuses from '../client/components/Bonuses';

export default class LowGravity extends GravityBonus {
	atlasFrame: string = 'low-gravity';
	description: string = 'Low gravity';

	getTargetPlayerKey(): string {
		return null;
	}

	start(bonuses: Bonuses) {
		bonuses.applyLowGravity.call(bonuses);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetGravity.call(bonuses);

		this.deactivate();
	}
};
