import Classic from './Classic';

const BONUS_INTERVAL = 2000;

export default class Hardcore extends Classic {
	overrideBonusMinimumInterval() {
		return BONUS_INTERVAL;
	}

	overrideBonusMaximumInterval() {
		return BONUS_INTERVAL;
	}
}
