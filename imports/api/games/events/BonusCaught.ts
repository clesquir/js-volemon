export default class BonusCaught {
	gameId: string;
	initialBonusClass: string;
	activatedBonusClass: string;
	targetPlayerKey: string;
	bonusClass: string;
	activatorPlayerKey: string;
	activationData: any;

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
