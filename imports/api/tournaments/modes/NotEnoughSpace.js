import {BONUS_SPAWN_MINIMUM_FREQUENCE} from '/imports/api/games/emissionConstants.js';
import Classic from './Classic';

export default class NotEnoughSpace extends Classic {
	overridesBonusSpawnInitialMinimumFrequence() {
		return true;
	}

	bonusSpawnInitialMinimumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return true;
	}

	bonusSpawnInitialMaximumFrequence() {
		return BONUS_SPAWN_MINIMUM_FREQUENCE;
	}

	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return 75;
	}

	overridesLevelSize() {
		return true;
	}

	levelSize() {
		return {
			width: 630,
			height: 420
		};
	}
}
