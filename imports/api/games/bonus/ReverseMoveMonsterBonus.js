import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class ReverseMoveMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'reverse-move-monster';
		this.description = 'Reverses player movements';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof ReverseMoveMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'isMoveReversed', true);
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'isMoveReversed', false);

		this.deactivate();
	}
};
