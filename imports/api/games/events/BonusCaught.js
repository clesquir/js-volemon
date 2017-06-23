export default class BonusCaught {
	constructor(gameId, initialBonusClass, activationData) {
		this.gameId = gameId;
		this.initialBonusClass = initialBonusClass;
		this.activatedBonusClass = activationData.activatedBonusClass;
		this.targetPlayerKey = activationData.targetPlayerKey;
		this.bonusClass = activationData.bonusClass;
		this.activatorPlayerKey = activationData.activatorPlayerKey;
		this.activationData = activationData;
	}
}
