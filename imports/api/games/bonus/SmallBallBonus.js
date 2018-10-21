import BallScaleBonus from '/imports/api/games/bonus/BallScaleBonus.js';
import {BALL_SMALL_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class SmallBallBonus extends BallScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'small-ball';
		this.description = 'Small ball with low gravity';
	}

	start() {
		this.game.scaleSmallBall.call(this.game);
		this.game.setBallGravity.call(this.game, BALL_SMALL_GRAVITY_SCALE);
	}
};
