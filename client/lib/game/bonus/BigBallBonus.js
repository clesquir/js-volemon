import BallScaleBonus from '/client/lib/game/bonus/BallScaleBonus.js';

export default class BigBallBonus extends BallScaleBonus {

	constructor(game) {
		super(game);
		this.letter = 'B';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.BIG_SCALE_BONUS);
	}

};
