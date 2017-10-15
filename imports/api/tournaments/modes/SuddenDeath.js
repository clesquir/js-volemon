import Classic from './Classic';

const POINTS_TO_WIN = 1;

export default class SuddenDeath extends Classic {
	overrideForfeitMinimumPoints() {
		return POINTS_TO_WIN;
	}

	overrideMaximumPoints() {
		return POINTS_TO_WIN;
	}
}
