import MonsterBonus from '/imports/api/games/bonus/MonsterBonus.js';

export default class CureBonus extends MonsterBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'cure';
		this.description = 'Cures poison (only available in tournament)';
	}

	start() {
	}

	stop() {
		this.deactivate();
	}
};
