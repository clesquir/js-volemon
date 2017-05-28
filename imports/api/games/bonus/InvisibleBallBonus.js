import BallBonus from '/imports/api/games/bonus/BallBonus.js';

export default class InvisibleBallBonus extends BallBonus {

	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 2000;
		this.spriteBorderKey = 'bonus-environment-negative';
		this.bonusIconsIndex = 0;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InvisibleBallBonus;
	}

	start() {
		this.game.hideBall.call(this.game);
	}

	stop() {
		this.game.showBall.call(this.game);

		this.deactivate();
	}

};
