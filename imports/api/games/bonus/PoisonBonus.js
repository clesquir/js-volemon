import CureBonus from '/imports/api/games/bonus/CureBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class PoisonBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 10000;
		this.atlasFrame = 'poison';
		this.description = '10s before death (only available in tournament)';
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

		if (bonus instanceof InvincibleMonsterBonus && playerKey === this.activatorPlayerKey) {
			return true;
		}

		return false;
	}

	start() {
		if (this.game.isInvincible.call(this.game, this.activatorPlayerKey)) {
			this.durationMilliseconds = 0;
			this.deactivate();
		}
	}

	stop() {
		this.game.killPlayer.call(this.game, this.activatorPlayerKey);

		this.deactivate();
	}
};
