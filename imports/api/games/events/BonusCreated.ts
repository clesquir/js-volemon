import {BonusStreamData} from "../bonus/data/BonusStreamData";
import Event from '../../../lib/events/Event';

export default class BonusCreated implements Event {
	readonly gameId: string;
	readonly data: BonusStreamData;

	constructor(gameId: string, data: BonusStreamData) {
		this.gameId = gameId;
		this.data = data;
	}

	static getClassName(): string {
		return 'BonusCreated';
	}

	getClassName(): string {
		return BonusCreated.getClassName();
	}
}
