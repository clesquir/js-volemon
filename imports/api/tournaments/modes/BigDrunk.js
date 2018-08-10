import {BONUS_JUNK_FOOD_MONSTER, BONUS_DRUNK_MONSTER, BONUS_RANDOM} from '/imports/api/games/bonusConstants.js';
import Classic from '/imports/api/tournaments/modes/Classic.js';
import {BONUS_SPAWN_MINIMUM_FREQUENCE} from '/imports/api/games/emissionConstants.js';

export default class BigDrunk extends Classic {
	overridesBonusSpawnInitialMinimumFrequence() {
		return true;
	}

	bonusSpawnInitialMinimumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return true;
	}

	bonusSpawnInitialMaximumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_JUNK_FOOD_MONSTER,
			BONUS_DRUNK_MONSTER,
			BONUS_RANDOM
		];
	}

	overridesAvailableBonusesForRandom() {
		return true;
	}

	availableBonusesForRandom() {
		return [
			BONUS_JUNK_FOOD_MONSTER,
			BONUS_DRUNK_MONSTER
		];
	}
}
