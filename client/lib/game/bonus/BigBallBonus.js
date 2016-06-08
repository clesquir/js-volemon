import BallScaleBonus from '/client/lib/game/bonus/BallScaleBonus.js';

export default class BigBallBonus extends BallScaleBonus {

	constructor(game) {
		super(game);
		this.spriteKey = 'bonus-environment-positive';
		this.letter = '\uf065';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.BIG_SCALE_BONUS);
	}

};
