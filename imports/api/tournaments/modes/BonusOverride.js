import {
	BONUS_BIG_BALL,
	BONUS_BIG_MONSTER,
	BONUS_HIGH_GRAVITY,
	BONUS_LOW_GRAVITY,
	BONUS_NOTHING,
	BONUS_SMALL_BALL,
	BONUS_SMALL_MONSTER,
} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BonusOverride extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_SMALL_BALL,
			BONUS_BIG_BALL,
			BONUS_SMALL_MONSTER,
			BONUS_BIG_MONSTER,
			BONUS_LOW_GRAVITY,
			BONUS_HIGH_GRAVITY,
			BONUS_NOTHING,
		];
	}
}
