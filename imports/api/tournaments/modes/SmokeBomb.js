import Classic from './Classic';
import {BONUS_SMOKE_BOMB} from '/imports/api/games/bonusConstants.js';

const MINIMUM_FREQUENCE = 8000;
const MAXIMUM_FREQUENCE = 10000;

export default class SmokeBomb extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_SMOKE_BOMB
		];
	}

	overridesBonusSpawnInitialMinimumFrequence() {
		return true;
	}

	bonusSpawnInitialMinimumFrequence() {
		return MINIMUM_FREQUENCE;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return true;
	}

	bonusSpawnInitialMaximumFrequence() {
		return MAXIMUM_FREQUENCE;
	}
}
