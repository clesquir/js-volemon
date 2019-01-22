import BaseBonus from './BaseBonus';

export default class GravityBonus extends BaseBonus {
	getTargetPlayerKey(): string {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof GravityBonus;
	}
};
