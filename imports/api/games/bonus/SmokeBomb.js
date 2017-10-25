import BaseBonus from '/imports/api/games/bonus/BaseBonus.js';

export default class SmokeBomb extends BaseBonus {
	constructor(...args) {
		super(...args);
		this.durationMilliseconds = 60000;
		this.spriteBorderKey = 'bonus-environment-negative';
		this.bonusIconsIndex = 4;
	}

	getTargetPlayerKey() {
		return null;
	}

	beforeActivation(payload) {
		this.xPosition = payload.x;
		this.yPosition = payload.y;
	}

	beforeActivationData() {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.xPosition = this.xPosition;
		beforeActivationData.yPosition = this.yPosition;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData) {
		this.xPosition = beforeActivationData.xPosition;
		this.yPosition = beforeActivationData.yPosition;
	}

	activationData() {
		const activationData = super.activationData();

		activationData.xPosition = this.xPosition;
		activationData.yPosition = this.yPosition;

		return activationData;
	}

	start() {
		this.game.drawSmokeBomb.call(this.game, this.getIdentifier(), this.xPosition, this.yPosition);
	}

	stop() {
		this.game.hideSmokeBomb.call(this.game, this.getIdentifier());

		this.deactivate();
	}
};
