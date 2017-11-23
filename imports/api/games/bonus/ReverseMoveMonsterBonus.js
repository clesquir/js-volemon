import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class ReverseMoveMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf0ec';
		this.description = 'Reverses player movements';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ReverseMoveMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'moveModifier', -1);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'moveModifier', 1);

		this.deactivate();
	}
};
