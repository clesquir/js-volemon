import {BONUS_SMALL_BALL, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants.js';
import {BONUS_SPAWN_MINIMUM_FREQUENCE} from '/imports/api/games/emissionConstants.js';
import Classic from './Classic';

const netHeight = 10;

export default class TeenyTinyWorld extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_SMALL_BALL,
			BONUS_SMALL_MONSTER
		];
	}

	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_SMALL_BALL,
			BONUS_SMALL_MONSTER
		];
	}

	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return netHeight;
	}

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
}
