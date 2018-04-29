import {BONUS_INSTANT_DEATH, BONUS_REPELLENT} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BonusOverride extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_INSTANT_DEATH,
			BONUS_REPELLENT
		];
	}
}
