import GravityBonus from '/imports/api/games/bonus/GravityBonus.js';

export default class HighGravity extends GravityBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'high-gravity';
		this.description = 'High gravity';
	}

	getTargetPlayerKey() {
		return null;
	}

	start() {
		this.game.scaleGravity.call(this.game, 2.75);
	}

	stop() {
		this.game.resetGravityScale.call(this.game);

		this.deactivate();
	}
};
