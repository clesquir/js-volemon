import BallScaleBonus from '/client/lib/game/bonus/BallScaleBonus.js';
import { Constants } from '/lib/constants.js';

export default class BigBallBonus extends BallScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment-positive';
		this.letter = '\uf111';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.BIG_SCALE_BONUS);
		this.game.setBallGravity.call(this.game, Constants.BALL_BIG_GRAVITY_SCALE);
	}

};
