import Classic from './Classic';

export default class BonusDuration extends Classic {
	overridesBonusDuration() {
		return true;
	}

	bonusDuration() {
		return 6000000;
	}
}
