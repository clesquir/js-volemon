import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class FastMonsterBonus extends MonsterBonus {

	constructor(game) {
		super(game);
		this.letter = 'F';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof FastMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove * 2);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityXOnMove', Config.playerVelocityXOnMove);

		this.deactivate();
	}

};
