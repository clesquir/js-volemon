import BallScaleBonus from '/imports/game/bonus/BallScaleBonus.js';
import {SMALL_SCALE_BALL_BONUS, BALL_SMALL_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class SmallBallBonus extends BallScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment-negative';
		this.letter = '\uf111';
		this.fontSize = '8px';
	}

	start() {
		this.game.scaleBall.call(this.game, SMALL_SCALE_BALL_BONUS);
		this.game.setBallGravity.call(this.game, BALL_SMALL_GRAVITY_SCALE);
	}

};
