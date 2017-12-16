import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class CloakedMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'cloaked-monster.png';
		this.description = 'Hides from opposite player';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof CloakedMonsterBonus && bonus.getTargetPlayerKey() === this.getTargetPlayerKey();
	}

	start() {
		this.game.hideFromOpponent.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.showToOpponent.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}
};
