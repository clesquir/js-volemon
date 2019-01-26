import {BONUS_DURATION} from '../emissionConstants';
import {getUTCTimeStamp} from '../../../lib/utils';
import {BonusStreamData} from "./data/BonusStreamData";
import {BonusActivationData} from "./data/BonusActivationData";
import Bonuses from "../client/components/Bonuses";
import {BonusBeforeActivationData} from "./data/BonusBeforeActivationData";
import {BonusPayloadData} from "./data/BonusPayloadData";

export default class BaseBonus {
	className: string;
	durationMilliseconds: number = BONUS_DURATION;
	createdAt: number;
	isActive: boolean = false;
	activatorPlayerKey: string = null;
	activatedAt: number = null;
	atlasFrame: string = '';
	description: string = '';

	randomBonus: BaseBonus;

	constructor(className: string) {
		this.className = className;
		this.createdAt = getUTCTimeStamp();

		this.init();
	}

	init() {
	}

	dataToStream(): BonusStreamData {
		return {
			bonusClass: this.getClassName(),
			bonusIdentifier: this.getIdentifier(),
			createdAt: this.createdAt
		};
	}

	getIdentifier(): string {
		return this.className + '_' + this.createdAt;
	}

	activationIdentifier(): string {
		return this.className + '_' + this.activatorPlayerKey + '_' + this.activatedAt;
	}

	getClassName(): string {
		return this.className;
	}

	hasRandomBonus(): boolean {
		return false;
	}

	setRandomBonus(randomBonus: BaseBonus) {
		this.randomBonus = randomBonus;
	}

	bonusToActivate(): BaseBonus {
		return this;
	}

	classNameToActivate(): string {
		return this.getClassName();
	}

	getDuration(): number {
		return this.durationMilliseconds;
	}

	canOverrideDuration(): boolean {
		return true;
	}

	getActivatorPlayerKey(): string {
		return this.activatorPlayerKey;
	}

	getTargetPlayerKey(): string {
		return this.activatorPlayerKey;
	}

	canActivate(): boolean {
		if (this.bonusToActivate() !== this) {
			return this.bonusToActivate().canActivate();
		}

		return true;
	}

	beforeActivation(bonuses: Bonuses, payload: BonusPayloadData) {
		if (this.bonusToActivate() !== this) {
			this.bonusToActivate().beforeActivation(bonuses, payload);
		}
	}

	beforeActivationData(): BonusBeforeActivationData {
		if (this.bonusToActivate() !== this) {
			return this.bonusToActivate().beforeActivationData();
		}

		return {};
	}

	reassignBeforeActivationData(beforeActivationData: BonusBeforeActivationData) {
	}

	activate(playerKey: string, activatedAt: number) {
		//Sets the bonus active and keep reference of the activator player and date
		this.isActive = true;
		this.activatorPlayerKey = playerKey;
		this.activatedAt = activatedAt;
	}

	activationData(): BonusActivationData {
		return {
			bonusIdentifier: this.getIdentifier(),
			activatedBonusClass: this.classNameToActivate(),
			targetPlayerKey: this.getTargetPlayerKey(),
			bonusClass: this.getClassName(),
			activatorPlayerKey: this.getActivatorPlayerKey(),
			beforeActivationData: this.beforeActivationData()
		};
	}

	deactivate() {
		this.isActive = false;
	}

	check(bonuses: Bonuses, currentTimestamp: number): boolean {
		//Deactivate the bonus if the duration has elapsed
		if (!this.isActive) {
			return false;
		}

		if (currentTimestamp - this.activatedAt >= this.durationMilliseconds) {
			this.stop(bonuses);
			return false;
		}

		return true;
	}

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
	}

	stop(bonuses: Bonuses) {
		//Stops bonus and resets to initial state
		this.deactivate();
	}

	shouldBeRemovedWhenKilling(): boolean {
		return true;
	}
};
