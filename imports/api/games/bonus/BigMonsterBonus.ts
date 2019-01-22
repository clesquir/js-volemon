import MonsterScaleBonus from './MonsterScaleBonus';
import Bonuses from "../client/components/Bonuses";

export default class BigMonsterBonus extends MonsterScaleBonus {
	atlasFrame: string = 'big-monster';
	description: string = 'Big player with high gravity';

	start(bonuses: Bonuses) {
		bonuses.scaleBigPlayer.call(bonuses, this.activatorPlayerKey);
	}
};
