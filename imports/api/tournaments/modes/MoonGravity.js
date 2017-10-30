import Classic from './Classic';

const bonusRadius = 16;
const gravity = 450;

export default class MoonGravity extends Classic {
	overridesBonusRadius() {
		return true;
	}

	bonusRadius() {
		return bonusRadius;
	}

	overridesWorldGravity() {
		return true;
	}

	worldGravity() {
		return gravity;
	}
}
