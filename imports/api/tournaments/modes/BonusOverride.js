import {BONUS_INSTANT_DEATH} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

export default class BonusOverride extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_INSTANT_DEATH
		];
	}
}
