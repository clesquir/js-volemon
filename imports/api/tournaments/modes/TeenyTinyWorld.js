import {BONUS_SMALL_BALL, BONUS_SMALL_MONSTER} from '/imports/api/games/bonusConstants.js';
import Classic from './Classic';

const netHeight = 10;

export default class TeenyTinyWorld extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
		return [
			BONUS_SMALL_BALL,
			BONUS_SMALL_MONSTER
		];
	}

	overridesRandomBonusKeyList() {
		return true;
	}

	randomBonusKeyList() {
		return [
			BONUS_SMALL_BALL,
			BONUS_SMALL_MONSTER
		];
	}

	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return netHeight;
	}
}
