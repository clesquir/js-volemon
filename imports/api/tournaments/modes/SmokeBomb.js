import Classic from './Classic';
import {BONUS_SMOKE_BOMB} from '/imports/api/games/bonusConstants.js';

export default class SmokeBomb extends Classic {
	overrideRandomBonusKey() {
		return [
			BONUS_SMOKE_BOMB
		];
	}

	overrideAvailableBonuses() {
		return [
			BONUS_SMOKE_BOMB
		];
	}
}
