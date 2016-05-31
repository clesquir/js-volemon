import MovementMonsterBonus from '/client/lib/game/bonus/MovementMonsterBonus.js';

export default class FastMonsterBonus extends MovementMonsterBonus {

	constructor(game) {
		super(game);
		this.letter = 'F';
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove * 2);
	}

};
