import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class FreezeMonsterBonus extends MonsterBonus {

	constructor(game) {
		super(game);
		this.durationMilliseconds = 5000;
		this.spriteKey = 'bonus-target-negative';
		this.letter = '\uf04c';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof FreezeMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.freezePlayer.call(this.game, this.activatorPlayerKey);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canMove', false);
	}

	stop() {
		this.game.unFreezePlayer.call(this.game, this.activatorPlayerKey);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canMove', true);

		this.deactivate();
	}

};
