import Event from '../../../lib/events/Event';

export default class LastPointUpdated implements Event {
	readonly gameId: string;
	readonly lastPointAt: number;

	constructor(gameId: string, lastPointAt: number) {
		this.gameId = gameId;
		this.lastPointAt = lastPointAt;
	}

	static getClassName(): string {
		return 'LastPointUpdated';
	}

	getClassName(): string {
		return LastPointUpdated.getClassName();
	}
}
