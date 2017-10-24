import Classic from './Classic';
import {BONUS_RANDOM} from '/imports/api/games/bonusConstants.js';

export default class RandomBonuses extends Classic {
	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_RANDOM
		];
	}
}
