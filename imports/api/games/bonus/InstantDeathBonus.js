import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class InstantDeathBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'instant-death';
		this.description = 'Instant death';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InstantDeathBonus;
	}

	canOverrideDuration() {
		return false;
	}

	start() {
		this.game.killPlayer.call(this.game, this.activatorPlayerKey);
	}
};
