import {Random} from 'meteor/random';
import Classic from './Classic';

const bonusRadius = 16;
const gravity = 1500;

export default class JupiterGravity extends Classic {
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
