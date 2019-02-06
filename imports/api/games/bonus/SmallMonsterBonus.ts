import MonsterScaleBonus from './MonsterScaleBonus';
import Bonuses from "../client/component/Bonuses";

export default class SmallMonsterBonus extends MonsterScaleBonus {
	atlasFrame: string = 'small-monster';
	description: string = 'Small player with low gravity';

	start(bonuses: Bonuses) {
		bonuses.scaleSmallPlayer.call(bonuses, this.activatorPlayerKey);
	}
};
