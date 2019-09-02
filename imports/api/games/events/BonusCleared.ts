import {BonusStreamData} from "../bonus/data/BonusStreamData";
import Event from '../../../lib/events/Event';

export default class BonusCleared implements Event {
	readonly gameId: string;
	readonly data: BonusStreamData;

	constructor(gameId: string, data: BonusStreamData) {
		this.gameId = gameId;
		this.data = data;
	}

	static getClassName(): string {
		return 'BonusCleared';
	}

	getClassName(): string {
		return BonusCleared.getClassName();
	}
}
