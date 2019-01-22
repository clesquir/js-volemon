import BallScaleBonus from './BallScaleBonus';
import Bonuses from "../client/components/Bonuses";

export default class SmallBallBonus extends BallScaleBonus {
	atlasFrame: string = 'small-ball';
	description: string = 'Small ball with low gravity';

	start(bonuses: Bonuses) {
		bonuses.scaleSmallBall.call(bonuses);
	}
};
