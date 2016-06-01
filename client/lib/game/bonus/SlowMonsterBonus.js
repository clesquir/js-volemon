import MovementMonsterBonus from '/client/lib/game/bonus/MovementMonsterBonus.js';

export default class SlowMonsterBonus extends MovementMonsterBonus {

	constructor(game) {
		super(game);
		this.letter = '\uf252';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove / 2);
	}

};
