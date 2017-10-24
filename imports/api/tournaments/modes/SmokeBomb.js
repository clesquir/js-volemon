import Classic from './Classic';
import {BONUS_SMOKE_BOMB} from '/imports/api/games/bonusConstants.js';

export default class SmokeBomb extends Classic {
	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_SMOKE_BOMB
		];
	}

	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_SMOKE_BOMB
		];
	}
}
