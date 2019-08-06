import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class ReviveBonus extends BaseBonus {
	atlasFrame: string = 'revive';
	description: string = 'Revive teammate';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof ReviveBonus;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.reviveTeammatePlayer.call(bonuses, this.activatorPlayerKey);
	}
};
