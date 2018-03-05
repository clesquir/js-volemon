import {
	BONUS_CLOAKED_MONSTER,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER
} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BlankScreen extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_INVISIBLE_BALL,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_CLOAKED_MONSTER
		];
	}

	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_INVISIBLE_BALL,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_CLOAKED_MONSTER
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
