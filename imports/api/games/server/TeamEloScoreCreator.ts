import EloScoreCreator from "./EloScoreCreator";
import {TeamEloScores} from "../teameloscores";

export default class TeamEloScoreCreator extends EloScoreCreator {
	insert(data) {
		if (data.userId !== 'CPU') {
			TeamEloScores.insert(data);
		}
	}
}
