import {BONUS_SHAPE_SHIFT} from '/imports/api/games/bonusConstants.js';
import {BONUS_SPAWN_MINIMUM_FREQUENCE} from '/imports/api/games/emissionConstants.js';
import Classic from '/imports/api/tournaments/modes/Classic.js';

export default class ShapeShifter extends Classic {
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
			BONUS_SHAPE_SHIFT
		];
	}
}
