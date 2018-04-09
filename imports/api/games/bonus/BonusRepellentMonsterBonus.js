import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class BonusRepellentMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 30000;
		this.atlasFrame = 'bonus-repellent';
		this.description = 'Bonus repellent';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BonusRepellentMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canActivateBonuses', false);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canActivateBonuses', true);

		this.deactivate();
	}
};
