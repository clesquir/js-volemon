import Event from '../../../lib/events/Event';

export default class PlayerKilled implements Event {
	gameId: string;
	playerKey: string;
	killedAt: number;

	constructor(gameId: string, playerKey: string, killedAt: number) {
		this.gameId = gameId;
		this.playerKey = playerKey;
		this.killedAt = killedAt;
	}

	static getClassName(): string {
		return 'PlayerKilled';
	}

	getClassName(): string {
		return PlayerKilled.getClassName();
	}
}
