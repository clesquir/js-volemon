import BaseBonus from './BaseBonus';
import Bonuses from '../client/component/Bonuses';

export default class NukeBonus extends BaseBonus {
	atlasFrame: string = 'nuke';
	description: string = 'Nuke all players';
	durationMilliseconds: number = 0;

	isSimilarBonusForPlayerKey(bonus: BaseBonus, playerKey: string): boolean {
		return bonus instanceof NukeBonus;
	}

	canOverrideDuration(): boolean {
		return false;
	}

	start(bonuses: Bonuses) {
		bonuses.nukeAllPlayers.call(bonuses);
	}
};
