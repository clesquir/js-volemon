import GravityBonus from './GravityBonus';
import Bonuses from '../client/components/Bonuses';

export default class HighGravity extends GravityBonus {
	atlasFrame: string = 'high-gravity';
	description: string = 'High gravity';

	getTargetPlayerKey(): string {
		return null;
	}

	start(bonuses: Bonuses) {
		bonuses.scaleGravity.call(bonuses, 2.75);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetGravityScale.call(bonuses);

		this.deactivate();
	}
};
