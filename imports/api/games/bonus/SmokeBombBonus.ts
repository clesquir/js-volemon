import BaseBonus from './BaseBonus';
import {BonusActivationData} from "./data/BonusActivationData";
import Bonuses from "../client/components/Bonuses";
import {getRandomInt} from "../../../lib/utils";
import {BonusBeforeActivationData} from "./data/BonusBeforeActivationData";
import {BonusPayloadData} from "./data/BonusPayloadData";

export default class SmokeBombBonus extends BaseBonus {
	atlasFrame: string = 'smoke-bomb';
	description: string = 'Smoke bomb';
	durationMilliseconds: number = 60000;

	xPosition: number;
	yPosition: number;
	angle: number;

	getTargetPlayerKey(): string {
		return null;
	}

	beforeActivation(bonuses: Bonuses, payload: BonusPayloadData) {
		this.xPosition = payload.x;
		this.yPosition = payload.y;
		this.angle = getRandomInt(-180, 180);
	}

	beforeActivationData(): BonusBeforeActivationData {
		const beforeActivationData = super.beforeActivationData();

		beforeActivationData.xPosition = this.xPosition;
		beforeActivationData.yPosition = this.yPosition;
		beforeActivationData.angle = this.angle;

		return beforeActivationData;
	}

	reassignBeforeActivationData(beforeActivationData: BonusBeforeActivationData) {
		this.xPosition = beforeActivationData.xPosition;
		this.yPosition = beforeActivationData.yPosition;
		this.angle = beforeActivationData.angle;
	}

	activationData(): BonusActivationData {
		const activationData = super.activationData();

		activationData.xPosition = this.xPosition;
		activationData.yPosition = this.yPosition;
		activationData.angle = this.angle;

		return activationData;
	}

	start(bonuses: Bonuses) {
		bonuses.showSmokeBomb.call(bonuses, this.getIdentifier(), this.xPosition, this.yPosition, this.angle);
	}

	stop(bonuses: Bonuses) {
		bonuses.hideSmokeBomb.call(bonuses, this.getIdentifier());

		this.deactivate();
	}
};
