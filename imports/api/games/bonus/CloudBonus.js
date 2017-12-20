import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class CloudBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 30000;
		this.atlasFrame = 'cloud';
		this.description = 'Cloud';
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
