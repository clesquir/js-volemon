import MonsterBonus from '/imports/game/bonus/MonsterBonus.js';

export default class JumpMonsterBonus extends MonsterBonus {

	constructor(...args) {
		super(...args);
		this.spriteBorderKey = 'bonus-target-negative';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof JumpMonsterBonus && playerKey == this.activatorPlayerKey;
	}

};
