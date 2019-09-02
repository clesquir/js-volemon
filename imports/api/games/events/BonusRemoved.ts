import Event from '../../../lib/events/Event';

export default class BonusRemoved implements Event {
	readonly gameId: string;
	readonly identifier: string;
	readonly activatedBonusClass: string;
	readonly targetPlayerKey: string;
	readonly bonusClass: string;
	readonly activatorPlayerKey: string;

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

	static getClassName(): string {
		return 'BonusRemoved';
	}

	getClassName(): string {
		return BonusRemoved.getClassName();
	}
}
