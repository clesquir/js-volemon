import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class ResetBallHitCountBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'reset-ball-hit-count';
		this.description = 'Reset team ball hit count';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ResetBallHitCountBonus;
	}

	canOverrideDuration() {
		return false;
	}

	start() {
		this.game.resetBallHitCount.call(this.game, this.activatorPlayerKey);
	}
};
