import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class NoJumpMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
		this.letter = '\uf13d';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof NoJumpMonsterBonus && playerKey == this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', false);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'canJump', true);

		this.deactivate();
	}

};
