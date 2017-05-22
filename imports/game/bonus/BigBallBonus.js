import BallScaleBonus from '/imports/game/bonus/BallScaleBonus.js';
import {BIG_SCALE_BONUS, BALL_BIG_GRAVITY_SCALE} from '/imports/api/games/constants.js';

export default class BigBallBonus extends BallScaleBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-environment-positive';
		this.letter = '\uf111';
	}

	start() {
		this.game.scaleBall.call(this.game, BIG_SCALE_BONUS);
		this.game.setBallGravity.call(this.game, BALL_BIG_GRAVITY_SCALE);
	}

};
