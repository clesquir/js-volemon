import MonsterBonus from './MonsterBonus';

export default class CureBonus extends MonsterBonus {
	atlasFrame: string = 'cure';
	description: string = 'Cures poison (only available in tournament)';
	durationMilliseconds: number = 0;

	hasClearedMostRecentPoison: boolean = false;

	canOverrideDuration(): boolean {
		return false;
	}
};
