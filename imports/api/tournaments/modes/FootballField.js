import Classic from './Classic';

export default class FootballField extends Classic {
	overridesLevelSize() {
		return true;
	}

	levelSize() {
		return {
			width: 1024,
			height: 600
		};
	}
}
