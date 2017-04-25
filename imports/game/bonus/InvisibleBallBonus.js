import BallBonus from '/imports/game/bonus/BallBonus.js';

export default class InvisibleBallBonus extends BallBonus {

	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 2000;
		this.spriteBorderKey = 'bonus-environment-negative';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InvisibleBallBonus;
	}

	contentToDraw(engine) {
		const bonus = engine.addSprite(0, 0, 'bonus-icons', 0, undefined, true);
		engine.setAnchor(bonus, 0.5);

		return [bonus];
	}

	start() {
		this.game.hideBall.call(this.game);
	}

	stop() {
		this.game.showBall.call(this.game);

		this.deactivate();
	}

};
