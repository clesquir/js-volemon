import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class InvisibilityMonsterBonus extends MonsterBonus {

	constructor(game) {
		super(game);
		this.durationMilliseconds = 5000;
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf070';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof InvisibilityMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.hidePlayingPlayer.call(this.game, this.activatorPlayerKey);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'alpha', 1);

		this.deactivate();
	}

};
