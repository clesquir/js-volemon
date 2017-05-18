export default class BonusRemoved {
	constructor(gameId, activatedBonusClass, targetPlayerKey, bonusClass, activatorPlayerKey) {
		this.gameId = gameId;
		this.activatedBonusClass = activatedBonusClass;
		this.targetPlayerKey = targetPlayerKey;
		this.bonusClass = bonusClass;
		this.activatorPlayerKey = activatorPlayerKey;
	}
}
