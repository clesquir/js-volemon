export default class GameReplayStarted {
	readonly gameId: string;

	constructor(gameId: string) {
		this.gameId = gameId;
	}
}
