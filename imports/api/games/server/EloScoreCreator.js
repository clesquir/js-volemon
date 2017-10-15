import {EloScores} from '/imports/api/games/eloscores.js';

export default class EloScoreCreator {
	insert(data) {
		EloScores.insert(data);
	}
}
