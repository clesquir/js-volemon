import BallScaleBonus from './BallScaleBonus';
import Bonuses from "../client/components/Bonuses";

export default class BigBallBonus extends BallScaleBonus {
	atlasFrame: string = 'big-ball';
	description: string = 'Big ball with high gravity';

	start(bonuses: Bonuses) {
		bonuses.scaleBigBall.call(bonuses);
	}
};
