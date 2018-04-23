import MovementMonsterBonus from '/imports/api/games/bonus/MovementMonsterBonus.js';

export default class FastMonsterBonus extends MovementMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'fast-monster';
		this.description = 'Speeds up player';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'moveModifier', () => {return 2;});
	}
};
