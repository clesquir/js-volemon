import Event from '../../../lib/events/Event';

export default class PlayerWon implements Event {
	gameId: string;
	userId: string;
	winnerPoints: number;
	loserPoints: number;

	constructor(gameId: string, userId: string, winnerPoints: number, loserPoints: number) {
		this.gameId = gameId;
		this.userId = userId;
		this.winnerPoints = winnerPoints;
		this.loserPoints = loserPoints;
	}

	static getClassName(): string {
		return 'PlayerWon';
	}

	getClassName(): string {
		return PlayerWon.getClassName();
	}
}
