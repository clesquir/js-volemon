import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class CloudBonus extends BaseBonus {

	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 30000;
		this.spriteBorderKey = 'bonus-environment-negative';
		this.letter = '\uf0c2';
	}

	getTargetPlayerKey() {
		return null;
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof CloudBonus;
	}

	start() {
		this.game.drawCloud.call(this.game);
	}

	stop() {
		this.game.hideCloud.call(this.game);

		this.deactivate();
	}

};
