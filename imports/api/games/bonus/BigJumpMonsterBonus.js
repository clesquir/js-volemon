import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class BigJumpMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'big-jump-monster';
		this.description = 'Super high player jumps';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BigJumpMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'verticalMoveModifier', () => {return 1.35;});
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'verticalMoveModifier', () => {return 1;});

		this.deactivate();
	}
};
