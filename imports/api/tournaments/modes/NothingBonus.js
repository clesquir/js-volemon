import Classic from './Classic';
import {BONUS_NOTHING} from '/imports/api/games/bonusConstants.js';

export default class NothingBonus extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_NOTHING
		];
	}
}
