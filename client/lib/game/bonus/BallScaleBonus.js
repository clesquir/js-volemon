import BallBonus from '/client/lib/game/bonus/BallBonus.js';

export default class BallScaleBonus extends BallBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BallScaleBonus;
	}

	stop() {
		this.game.resetBallScale.call(this.game);

		this.deactivate();
	}

};