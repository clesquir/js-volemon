import Classic from './Classic';
import {BONUS_INSTANT_DEATH} from '/imports/api/games/bonusConstants.js';

export default class InstantDeathBonus extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_INSTANT_DEATH
		];
	}
}
