export default class BonusCaught {
	readonly gameId: string;
	readonly initialBonusClass: string;
	readonly activatedBonusClass: string;
	readonly targetPlayerKey: string;
	readonly bonusClass: string;
	readonly activatorPlayerKey: string;
	readonly activationData: any;

	constructor(gameId: string, initialBonusClass: string, activationData: any) {
		this.gameId = gameId;
		this.initialBonusClass = initialBonusClass;
		this.activatedBonusClass = activationData.activatedBonusClass;
		this.targetPlayerKey = activationData.targetPlayerKey;
		this.bonusClass = activationData.bonusClass;
		this.activatorPlayerKey = activationData.activatorPlayerKey;
		this.activationData = activationData;
	}
}
