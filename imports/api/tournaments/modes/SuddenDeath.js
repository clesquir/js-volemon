import Classic from './Classic';

const MAXIMUM_POINTS = 1;

export default class SuddenDeath extends Classic {
	overridesForfeitMinimumPoints() {
		return true;
	}

	forfeitMinimumPoints() {
		return 0;
	}

	overridesMaximumPoints() {
		return true;
	}

	maximumPoints() {
		return MAXIMUM_POINTS;
	}
}
