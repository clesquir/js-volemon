import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class NothingBonus extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 0;
		this.atlasFrame = 'nothing';
		this.description = 'Does nothing but obstruct';
	}

	canActivate() {
		return false;
	}
};
