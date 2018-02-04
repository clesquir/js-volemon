import Classic from './Classic';

const netHeight = 10;

export default class TinyNet extends Classic {
	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return netHeight;
	}
}
