import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class FreezeMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 5000;
		this.atlasFrame = 'freeze-monster.png';
		this.description = 'Freezes the player';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof FreezeMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.freezePlayer.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.unFreezePlayer.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}
};
