import GravityBonus from '/imports/api/games/bonus/GravityBonus.js';

export default class LowGravity extends GravityBonus {
	constructor(...args) {
		super(...args);
		this.atlasFrame = 'low-gravity';
		this.description = 'Low gravity';
	}

	getTargetPlayerKey() {
		return null;
	}

	start() {
		this.game.scaleGravity.call(this.game, 0.55);
	}

	stop() {
		this.game.resetGravityScale.call(this.game);

		this.deactivate();
	}
};
