import Classic from './Classic';
import {BONUS_DEATH} from '/imports/api/games/bonusConstants.js';

export default class DeathBonus extends Classic {
	overrideRandomBonusKey() {
		return [
			BONUS_DEATH
		];
	}

	overrideAvailableBonuses() {
		return [
			BONUS_DEATH
		];
	}
}
