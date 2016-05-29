import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class BallBonus extends BaseBonus {

	constructor(game) {
		super(game);
		this.color = 0x0000FF;
	}

	stop() {
		this.game.resetBallScale.call(this.game);

		this.deactivate();
	}

};
