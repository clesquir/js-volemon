import BallBonus from '/client/lib/game/bonus/BallBonus.js';

export default class BallScaleBonus extends BallBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BallScaleBonus;
	}

};
