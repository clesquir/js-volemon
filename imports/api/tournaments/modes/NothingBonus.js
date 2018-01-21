import Classic from './Classic';
import {BONUS_NOTHING} from '/imports/api/games/bonusConstants.js';

export default class NothingBonus extends Classic {
	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_NOTHING
		];
	}

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_NOTHING
		];
	}
}
