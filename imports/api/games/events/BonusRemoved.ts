export default class BonusRemoved {
	gameId: string;
	identifier: string;
	activatedBonusClass: string;
	targetPlayerKey: string;
	bonusClass: string;
	activatorPlayerKey: string;

	constructor(
		gameId: string,
		identifier: string,
		activatedBonusClass: string,
		targetPlayerKey: string,
		bonusClass:string,
		activatorPlayerKey: string
	) {
		this.gameId = gameId;
		this.identifier = identifier;
		this.activatedBonusClass = activatedBonusClass;
		this.targetPlayerKey = targetPlayerKey;
		this.bonusClass = bonusClass;
		this.activatorPlayerKey = activatorPlayerKey;
	}
}
