import Classic from './Classic';

const netHeight = 115;

export default class TallNet extends Classic {
	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return netHeight;
	}
}
