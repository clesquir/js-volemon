export default class LastPointUpdated {
	readonly gameId: string;
	readonly lastPointAt: number;

	constructor(gameId: string, lastPointAt: number) {
		this.gameId = gameId;
		this.lastPointAt = lastPointAt;
	}
}
