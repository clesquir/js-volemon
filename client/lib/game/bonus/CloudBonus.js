import BaseBonus from '/client/lib/game/bonus/BaseBonus.js';

export default class CloudBonus extends BaseBonus {

	constructor(game) {
		super(game);
		this.spriteBorderKey = 'bonus-environment-negative';
		this.letter = '\uf0c2';
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
