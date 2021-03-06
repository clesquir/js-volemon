import Event from '../../../lib/events/Event';

export default class GamePlayStateCreated implements Event {
	readonly gameId: string;

	constructor(gameId: string) {
		this.gameId = gameId;
	}

	static getClassName(): string {
		return 'GamePlayStateCreated';
	}

	getClassName(): string {
		return GamePlayStateCreated.getClassName();
	}
}
