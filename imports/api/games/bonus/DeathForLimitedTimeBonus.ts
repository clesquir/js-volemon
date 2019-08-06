import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class DeathForLimitedTimeBonus extends BaseBonus {
	atlasFrame: string = 'death-for-limited-time';
	description: string = 'Death for 5s';
	durationMilliseconds: number = 5000;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof DeathForLimitedTimeBonus && playerKey === this.activatorPlayerKey;
	}

	start(bonuses: Bonuses) {
		bonuses.killPlayer.call(bonuses, this.activatorPlayerKey);
	}

	stop(bonuses: Bonuses) {
		bonuses.revivePlayer.call(bonuses, this.activatorPlayerKey);

		this.deactivate();
	}

	shouldBeRemovedWhenKilling(): boolean {
		return false;
	}
};
