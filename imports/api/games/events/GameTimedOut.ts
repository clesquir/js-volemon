import Event from '../../../lib/events/Event';

export default class GameTimedOut implements Event {
	gameId: string;

	constructor(gameId: string) {
		this.gameId = gameId;
	}

	static getClassName(): string {
		return 'GameTimedOut';
	}

	getClassName(): string {
		return GameTimedOut.getClassName();
	}
}
