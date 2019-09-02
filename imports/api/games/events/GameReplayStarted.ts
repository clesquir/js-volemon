import Event from '../../../lib/events/Event';

export default class GameReplayStarted implements Event {
	readonly gameId: string;

	constructor(gameId: string) {
		this.gameId = gameId;
	}

	static getClassName(): string {
		return 'GameReplayStarted';
	}

	getClassName(): string {
		return GameReplayStarted.getClassName();
	}
}
