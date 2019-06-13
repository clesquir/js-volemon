import {BonusStreamData} from "../bonus/data/BonusStreamData";

export default class BonusCreated {
	gameId: string;
	data: BonusStreamData;

	constructor(gameId: string, data: BonusStreamData) {
		this.gameId = gameId;
		this.data = data;
	}
}
