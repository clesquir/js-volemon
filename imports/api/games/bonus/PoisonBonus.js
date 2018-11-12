import CureBonus from '/imports/api/games/bonus/CureBonus.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class PoisonBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'poison';
		this.description = '10s before death';
	}

	isSimilarBonusForPlayerKey(bonus, playerKey) {
		if (bonus instanceof CureBonus && playerKey === this.activatorPlayerKey) {
			if (bonus.hasClearedMostRecentPoison) {
				return false;
			} else {
				bonus.hasClearedMostRecentPoison = true;
				return true;
			}
		}

		return false;
	}

	stop() {
		if (!this.game.isInvincible.call(this.game, this.activatorPlayerKey)) {
			this.game.killPlayer.call(this.game, this.activatorPlayerKey);
		}

		this.deactivate();
	}
};
