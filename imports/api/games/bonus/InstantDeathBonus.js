import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class InstantDeathBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.spriteBorderKey = 'bonus-target-negative';
		this.bonusIconsIndex = 5;
		this.description = 'Instant death (only available in tournament)';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InstantDeathBonus;
	}

	start() {
		this.game.killPlayer.call(this.game, this.activatorPlayerKey);
	}
};
