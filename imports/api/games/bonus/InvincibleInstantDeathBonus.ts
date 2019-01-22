import BaseBonus from './BaseBonus';
import {BonusStreamData} from "./BonusStreamData";
import {BONUS_INSTANT_DEATH, BONUS_INVINCIBLE_MONSTER} from '../bonusConstants';
import BonusFactory from '../BonusFactory';
import {Random} from 'meteor/random';

export default class InvincibleInstantDeathBonus extends BaseBonus {
	atlasFrame: string = 'invincible-instant-death';
	description: string = 'Invincible or Instant death';

	randomBonus: BaseBonus;

	init() {
		this.setRandomBonus(
			BonusFactory.fromClassName(
				Random.choice(
					[
						BONUS_INVINCIBLE_MONSTER,
						BONUS_INSTANT_DEATH,
					]
				)
			)
		);
	}

	dataToStream(): BonusStreamData {
		const data = super.dataToStream();

		data.randomBonusClass = this.randomBonus.getClassName();
		return data;
	}

	getIdentifier(): string {
		return super.getIdentifier() + '_' + this.randomBonus.getIdentifier();
	}

	hasRandomBonus(): boolean {
		return true;
	}

	bonusToActivate(): BaseBonus {
		return this.randomBonus;
	}
};
