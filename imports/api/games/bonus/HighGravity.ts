import GravityBonus from './GravityBonus';
import Bonuses from '../client/component/Bonuses';

export default class HighGravity extends GravityBonus {
	atlasFrame: string = 'high-gravity';
	description: string = 'High gravity';

	getTargetPlayerKey(): string {
		return null;
	}

	start(bonuses: Bonuses) {
		bonuses.applyHighGravity.call(bonuses);
	}

	stop(bonuses: Bonuses) {
		bonuses.resetGravity.call(bonuses);

		this.deactivate();
	}
};
