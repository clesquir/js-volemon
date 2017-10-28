import Classic from './Classic';

const gravity = 450;

export default class MoonGravity extends Classic {
	overridesWorldGravity() {
		return true;
	}

	worldGravity() {
		return gravity;
	}
}
