export default class BonusCleared {
	gameId: string;
	data: Object;

	constructor(gameId: string, data: Object) {
		this.gameId = gameId;
		this.data = data;
	}
}
