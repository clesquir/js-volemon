import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class UnfreezeMonsterBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'unfreeze-monster';
		this.description = 'Unfreezes the player (only available in tournament)';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		return bonus instanceof FreezeMonsterBonus && playerKey === this.activatorPlayerKey;
	}

	start() {
		this.game.unFreezePlayer.call(this.game, this.activatorPlayerKey);
	}
};
