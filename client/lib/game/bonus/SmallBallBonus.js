import BallScaleBonus from '/client/lib/game/bonus/BallScaleBonus.js';
import { Constants } from '/lib/constants.js';

export default class SmallBallBonus extends BallScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment-negative';
		this.letter = '\uf111';
		this.fontSize = '8px';
	}

	start() {
		this.game.scaleBall.call(this.game, Constants.SMALL_SCALE_BALL_BONUS);
	}

};
