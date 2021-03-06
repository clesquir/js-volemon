import {BonusBeforeActivationData} from "./BonusBeforeActivationData";

export declare type BonusActivationData = {
	bonusIdentifier: string;
	activatedBonusClass: string;
	targetPlayerKey: string;
	bonusClass: string;
	activatorPlayerKey: string;
	beforeActivationData: BonusBeforeActivationData;

	//Shape shift
	playerShape?: string;

	//Smoke bomb
	xPosition?: number;
	yPosition?: number;
	angle?: number;
};
