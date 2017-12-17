import {Random} from 'meteor/random';
import Classic from './Classic';
import {BONUS_INVISIBLE_MONSTER} from '/imports/api/games/bonusConstants.js';
import {BONUS_SPAWN_MINIMUM_FREQUENCE} from '/imports/api/games/emissionConstants.js';

const bonusRadius = 16;
const gravity = 1500;

export default class MassiveHardcoreBlindBulletproof extends Classic {
	overridesBonusRadius() {
		return true;
	}

	bonusRadius() {
		return bonusRadius;
	}

	overridesWorldGravity() {
		return true;
	}

	worldGravity() {
		return gravity;
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

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_INVISIBLE_MONSTER
		];
	}
}
