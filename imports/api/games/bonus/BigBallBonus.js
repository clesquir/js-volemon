import BallScaleBonus from '/imports/api/games/bonus/BallScaleBonus.js';
import {BALL_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigBallBonus extends BallScaleBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'big-ball';
		this.description = 'Big ball with high gravity';
	}

	start() {
		this.game.scaleBigBall.call(this.game);
		this.game.setBallGravity.call(this.game, BALL_BIG_GRAVITY_SCALE);
	}
};
