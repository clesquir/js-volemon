import BallScaleBonus from '/imports/game/bonus/BallScaleBonus.js';
import { Constants } from '/imports/lib/constants.js';

export default class SmallBallBonus extends BallScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment-negative';
		this.letter = '\uf111';
		this.fontSize = '8px';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.SMALL_SCALE_BALL_BONUS);
		this.game.setBallGravity.call(this.game, Constants.BALL_SMALL_GRAVITY_SCALE);
	}

};
