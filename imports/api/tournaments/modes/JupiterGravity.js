import {Random} from 'meteor/random';
import Classic from './Classic';

const gravity = 1500;

export default class JupiterGravity extends Classic {
	overridesWorldGravity() {
		return true;
	}

	worldGravity() {
		return gravity;
	}
}
