import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class CloakedMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-positive';
		this.letter = '\uf2ac';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof CloakedMonsterBonus && bonus.getTargetPlayerKey() == this.getTargetPlayerKey();
	}

	start() {
		this.game.hideFromOpponent.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.showToOpponent.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}

};
