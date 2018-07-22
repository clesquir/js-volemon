import {
	BONUS_POISON,
	BONUS_CURE,
} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BonusOverride extends Classic {
	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_POISON,
			BONUS_CURE,
		];
	}

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_POISON,
			BONUS_CURE,
		];
	}
}
