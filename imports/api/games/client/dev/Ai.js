import Dev from '/imports/api/games/client/dev/Dev.js';
import {Random} from 'meteor/random';

export default class Ai extends Dev {
	beforeStart() {
		this.gameData.firstPlayerComputer = true;
		this.gameData.secondPlayerComputer = true;
	}
}
