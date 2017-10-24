import Classic from './Classic';
import {BONUS_DEATH} from '/imports/api/games/bonusConstants.js';

export default class DeathBonus extends Classic {
	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_DEATH
		];
	}

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_DEATH
		];
	}
}
