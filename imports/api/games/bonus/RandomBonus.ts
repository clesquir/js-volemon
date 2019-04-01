import BaseBonus from './BaseBonus';

export default class RandomBonus extends BaseBonus {
	atlasFrame: string = 'random';
	description: string = 'Random bonus';

	dataToStream() {
		const data = super.dataToStream();
		data.randomBonusClass = this.getRandomBonus().getClassName();
		return data;
	}

	getIdentifier(): string {
		return super.getIdentifier() + '_' + this.getRandomBonus().getIdentifier();
	}

	getRandomBonus(): BaseBonus {
		let randomBonus = this.randomBonus;

		if (randomBonus.hasRandomBonus()) {
			randomBonus = randomBonus.randomBonus;
		}

		return randomBonus;
	}

	hasRandomBonus(): boolean {
		return true;
	}

	bonusToActivate(): BaseBonus {
		return this.getRandomBonus();
	}
};
