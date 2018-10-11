import {EloScores} from '/imports/api/games/eloscores.js';

export default class EloScoreCreator {
	insert(data) {
		if (data.userId !== 'CPU') {
			EloScores.insert(data);
		}
	}
}
