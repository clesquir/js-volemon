import BaseBonus from './BaseBonus';
import {BonusActivationData} from "./BonusActivationData";
import Bonuses from "../client/components/Bonuses";

export default class SmokeBombBonus extends BaseBonus {
	atlasFrame: string = 'smoke-bomb';
	description: string = 'Smoke bomb';
	durationMilliseconds: number = 60000;

	xPosition: number;
	yPosition: number;

	getTargetPlayerKey(): string {
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

	activationData(): BonusActivationData {
		const activationData = super.activationData();

		activationData.xPosition = this.xPosition;
		activationData.yPosition = this.yPosition;

		return activationData;
	}

	start(bonuses: Bonuses) {
		bonuses.drawSmokeBomb.call(bonuses, this.getIdentifier(), this.xPosition, this.yPosition);
	}

	stop(bonuses: Bonuses) {
		bonuses.hideSmokeBomb.call(bonuses, this.getIdentifier());

		this.deactivate();
	}
};
