import {Random} from 'meteor/random';
import Classic from './Classic';

export default class GravityOverride extends Classic {
	overridesBonusRadius() {
		return true;
	}

	bonusRadius() {
		return 14;
	}

	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return 72;
	}

	overridesWorldGravity() {
		return true;
	}

	worldGravity() {
		return 1500;
	}
}
