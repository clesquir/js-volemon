import {BonusStreamData} from "../bonus/data/BonusStreamData";

export default class BonusCleared {
	readonly gameId: string;
	readonly data: BonusStreamData;

	constructor(gameId: string, data: BonusStreamData) {
		this.gameId = gameId;
		this.data = data;
	}
}
