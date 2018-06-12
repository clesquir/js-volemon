import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class GravityBonus extends BaseBonus {
	getTargetPlayerKey() {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof GravityBonus;
	}
};
