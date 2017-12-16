import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class JumpMonsterBonus extends MonsterBonus {
	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof JumpMonsterBonus && playerKey === this.activatorPlayerKey;
	}
};
