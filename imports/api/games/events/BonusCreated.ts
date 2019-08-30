import {BonusStreamData} from "../bonus/data/BonusStreamData";

export default class BonusCreated {
	readonly gameId: string;
	readonly data: BonusStreamData;

	constructor(gameId: string, data: BonusStreamData) {
		this.gameId = gameId;
		this.data = data;
	}
}
