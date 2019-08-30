export default class GameStatusChanged {
	readonly gameId: string;
	readonly status: string;

	constructor(gameId: string, status: string) {
		this.gameId = gameId;
		this.status = status;
	}
}
