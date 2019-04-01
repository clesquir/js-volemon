import BaseBonus from './BaseBonus';

export default class NothingBonus extends BaseBonus {
	atlasFrame: string = 'nothing';
	description: string = 'Does nothing but obstruct';
	durationMilliseconds: number = 0;

	canOverrideDuration(): boolean {
		return false;
	}

	canActivate(): boolean {
		return false;
	}
};
