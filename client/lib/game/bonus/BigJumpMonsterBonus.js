import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class BigJumpMonsterBonus extends MonsterBonus {

	constructor(game) {
		super(game);
		this.letter = 'J';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof BigJumpMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', Config.playerVelocityYOnJump * 1.35);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'velocityYOnJump', Config.playerVelocityYOnJump);

		this.deactivate();
	}

};
