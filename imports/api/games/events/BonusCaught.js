export default class BonusCaught {
	constructor(gameId, activatedBonusClass, targetPlayerKey, bonusClass, activatorPlayerKey, initialBonusClass) {
		this.gameId = gameId;
		this.activatedBonusClass = activatedBonusClass;
		this.targetPlayerKey = targetPlayerKey;
		this.bonusClass = bonusClass;
		this.activatorPlayerKey = activatorPlayerKey;
		this.initialBonusClass = initialBonusClass;
	}
}
