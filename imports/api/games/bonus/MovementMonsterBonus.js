import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class MovementMonsterBonus extends MonsterBonus {
	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof MovementMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	stop() {
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'horizontalMoveMultiplier', 1);

		this.deactivate();
	}
};
