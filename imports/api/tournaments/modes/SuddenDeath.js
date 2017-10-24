import Classic from './Classic';

const POINTS_TO_WIN = 1;

export default class SuddenDeath extends Classic {
	overridesForfeitMinimumPoints() {
		return true;
	}

	forfeitMinimumPoints() {
		return POINTS_TO_WIN;
	}

	overridesMaximumPoints() {
		return true;
	}

	maximumPoints() {
		return POINTS_TO_WIN;
	}
}
