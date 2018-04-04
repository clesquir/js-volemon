import {
	BONUS_FREEZE_MONSTER,
	BONUS_UNFREEZE_MONSTER
} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class PausePlay extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_FREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
		];
	}

	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_FREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
			BONUS_UNFREEZE_MONSTER,
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
