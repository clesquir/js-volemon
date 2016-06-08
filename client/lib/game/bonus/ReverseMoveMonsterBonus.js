import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class ReverseMoveMonsterBonus extends MonsterBonus {

	constructor(game) {
		super(game);
		this.spriteKey = 'bonus-target-negative';
		this.letter = '\uf0ec';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ReverseMoveMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'leftMoveModifier', 1);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'rightMoveModifier', -1);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'leftMoveModifier', -1);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'rightMoveModifier', 1);

		this.deactivate();
	}

};
