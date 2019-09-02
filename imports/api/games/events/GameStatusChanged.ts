import Event from '../../../lib/events/Event';

export default class GameStatusChanged implements Event {
	readonly gameId: string;
	readonly status: string;

	constructor(gameId: string, status: string) {
		this.gameId = gameId;
		this.status = status;
	}

	static getClassName(): string {
		return 'GameStatusChanged';
	}

	getClassName(): string {
		return GameStatusChanged.getClassName();
	}
}
