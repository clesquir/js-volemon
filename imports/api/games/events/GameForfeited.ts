import Event from '../../../lib/events/Event';

export default class GameForfeited implements Event {
	gameId: string;

	constructor(gameId: string) {
		this.gameId = gameId;
	}

	static getClassName(): string {
		return 'GameForfeited';
	}

	getClassName(): string {
		return GameForfeited.getClassName();
	}
}
