import MonsterBonus from '/client/lib/game/bonus/MonsterBonus.js';

export default class MonsterScaleBonus extends MonsterBonus {

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof MonsterScaleBonus && playerKey == this.activatorPlayerKey;
	}

	stop() {
		this.game.resetPlayerScale.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}

};
