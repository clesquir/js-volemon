import Event from '../../../lib/events/Event';

export default class GameFinished implements Event {
	gameId: string;
	gameDuration: number;

	constructor(gameId: string, gameDuration: number) {
		this.gameId = gameId;
		this.gameDuration = gameDuration;
	}

	static getClassName(): string {
		return 'GameFinished';
	}

	getClassName(): string {
		return GameFinished.getClassName();
	}
}
