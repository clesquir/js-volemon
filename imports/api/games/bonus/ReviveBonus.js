import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class ReviveBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'revive';
		this.description = 'Revive teammate';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ReviveBonus;
	}

	start() {
		this.game.revivePlayer.call(this.game, this.activatorPlayerKey);
	}
};
