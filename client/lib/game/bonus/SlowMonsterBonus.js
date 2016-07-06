import MovementMonsterBonus from '/client/lib/game/bonus/MovementMonsterBonus.js';

export default class SlowMonsterBonus extends MovementMonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf252';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove / 2.5);
	}

};
