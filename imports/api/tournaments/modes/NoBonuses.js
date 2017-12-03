import Classic from './Classic';

export default class NoBonuses extends Classic {
	overridesHasBonuses() {
		return true;
	}

	hasBonuses() {
		return false;
	}
}
