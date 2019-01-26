import {BonusBeforeActivationData} from "./BonusBeforeActivationData";

export declare type BonusPayloadData = {
	identifier: string;
	player: string;
	activatedAt: number;
	x: number;
	y: number;
	beforeActivationData: BonusBeforeActivationData;
};
