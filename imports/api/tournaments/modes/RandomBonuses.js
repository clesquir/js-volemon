import Classic from './Classic';
import {BONUS_RANDOM} from '/imports/api/games/bonusConstants.js';

export default class RandomBonuses extends Classic {
	overrideRandomBonusKey() {
		return [
			BONUS_RANDOM
		];
	}
}
