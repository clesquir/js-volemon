import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class InstantDeathBonus extends BaseBonus {
	atlasFrame: string = 'instant-death';
	description: string = 'Instant death';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof InstantDeathBonus;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.killPlayer.call(bonuses, this.activatorPlayerKey);
	}
};
