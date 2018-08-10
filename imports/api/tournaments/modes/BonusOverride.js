import {BONUS_INSTANT_DEATH, BONUS_POISON, BONUS_RANDOM} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BonusOverride extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_POISON,
			BONUS_INSTANT_DEATH,
			BONUS_RANDOM,
		];
	}

	overridesAvailableBonusesForRandom() {
		return true;
	}

	availableBonusesForRandom() {
		return [
			BONUS_POISON,
			BONUS_INSTANT_DEATH,
		];
	}
}
