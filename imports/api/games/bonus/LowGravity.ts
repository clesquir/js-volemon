import GravityBonus from './GravityBonus';
import Bonuses from '../client/components/Bonuses';

export default class LowGravity extends GravityBonus {
	atlasFrame: string = 'low-gravity';
	description: string = 'Low gravity';

	getTargetPlayerKey(): string {
		return null;
	}

	start(bonuses: Bonuses) {
		bonuses.scaleGravity.call(bonuses, 0.55);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetGravityScale.call(bonuses);

		this.deactivate();
	}
};
