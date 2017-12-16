import BallScaleBonus from '/imports/api/games/bonus/BallScaleBonus.js';
import {BIG_SCALE_BONUS, BALL_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigBallBonus extends BallScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'big-ball.png';
		this.description = 'Big ball with high gravity';
	}

	start() {
		this.game.scaleBall.call(this.game, BIG_SCALE_BONUS);
		this.game.setBallGravity.call(this.game, BALL_BIG_GRAVITY_SCALE);
	}
};
