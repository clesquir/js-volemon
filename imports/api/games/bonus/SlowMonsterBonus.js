import MovementMonsterBonus from '/imports/api/games/bonus/MovementMonsterBonus.js';

export default class SlowMonsterBonus extends MovementMonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'slow-monster';
		this.description = 'Slows down player';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'horizontalMoveMultiplier', 0.4);
	}
};
