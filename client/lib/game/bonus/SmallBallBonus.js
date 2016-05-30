import BallScaleBonus from '/client/lib/game/bonus/BallScaleBonus.js';

export default class SmallBallBonus extends BallScaleBonus {

	constructor(game) {
		super(game);
		this.letter = 'S';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.SMALL_SCALE_BONUS);
	}

};
