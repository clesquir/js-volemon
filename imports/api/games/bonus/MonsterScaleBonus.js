import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class MonsterScaleBonus extends MonsterBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof MonsterScaleBonus && playerKey == this.activatorPlayerKey;
	}

	stop() {
		this.game.resetPlayerScale.call(this.game, this.activatorPlayerKey);
		this.game.resetPlayerGravity.call(this.game, this.activatorPlayerKey);
		this.game.changePlayerProperty.call(this.game, this.activatorPlayerKey, 'activeGravity', null);

		this.deactivate();
	}

};
