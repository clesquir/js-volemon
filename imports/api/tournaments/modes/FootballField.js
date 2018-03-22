import Classic from './Classic';

export default class FootballField extends Classic {
	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return 71;
	}

	overridesLevelSize() {
		return true;
	}

	levelSize() {
		return {
			width: 1020,
			height: 680
		};
	}
}