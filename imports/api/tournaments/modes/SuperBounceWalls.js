import Classic from './Classic';

const worldRestitution = 2;

export default class SuperBounceWalls extends Classic {
	overridesWorldRestitution() {
		return true;
	}

	worldRestitution() {
		return worldRestitution;
	}
}
