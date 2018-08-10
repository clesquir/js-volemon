import {
	BONUS_FREEZE_MONSTER,
	BONUS_FAST_MONSTER
} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class CatchMeIfYouCan extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_FREEZE_MONSTER,
			BONUS_FAST_MONSTER
		];
	}

	overridesBonusSpawnInitialMinimumFrequence() {
		return true;
	}

	bonusSpawnInitialMinimumFrequence() {
		return 5000;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return true;
	}

	bonusSpawnInitialMaximumFrequence() {
		return 7500;
	}
}
