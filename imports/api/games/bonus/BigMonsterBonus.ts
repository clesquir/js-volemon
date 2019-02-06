import MonsterScaleBonus from './MonsterScaleBonus';
import Bonuses from "../client/component/Bonuses";

export default class BigMonsterBonus extends MonsterScaleBonus {
	atlasFrame: string = 'big-monster';
	description: string = 'Big player with high gravity';

	start(bonuses: Bonuses) {
		bonuses.scaleBigPlayer.call(bonuses, this.activatorPlayerKey);
	}
};
