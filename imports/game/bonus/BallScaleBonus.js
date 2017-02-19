import BallBonus from '/imports/game/bonus/BallBonus.js';

export default class BallScaleBonus extends BallBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BallScaleBonus;
	}

	stop() {
		this.game.resetBallScale.call(this.game);
		this.game.resetBallGravity.call(this.game);

		this.deactivate();
	}

};
