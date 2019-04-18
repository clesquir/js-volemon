import {EloScores} from '../eloscores';

export default class EloScoreCreator {
	insert(data) {
		if (data.userId !== 'CPU') {
			EloScores.insert(data);
		}
	}
}
