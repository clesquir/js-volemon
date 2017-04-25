import SmallBallBonus from '/imports/game/bonus/SmallBallBonus.js';
import BigBallBonus from '/imports/game/bonus/BigBallBonus.js';
import InvisibleBallBonus from '/imports/game/bonus/InvisibleBallBonus.js';
import SmallMonsterBonus from '/imports/game/bonus/SmallMonsterBonus.js';
import BigMonsterBonus from '/imports/game/bonus/BigMonsterBonus.js';
import BigJumpMonsterBonus from '/imports/game/bonus/BigJumpMonsterBonus.js';
import SlowMonsterBonus from '/imports/game/bonus/SlowMonsterBonus.js';
import FastMonsterBonus from '/imports/game/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/game/bonus/FreezeMonsterBonus.js';
import ReverseMoveMonsterBonus from '/imports/game/bonus/ReverseMoveMonsterBonus.js';
import InvisibleMonsterBonus from '/imports/game/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/game/bonus/InvisibleOpponentMonsterBonus.js';
import CloudBonus from '/imports/game/bonus/CloudBonus.js';
import NoJumpMonsterBonus from '/imports/game/bonus/NoJumpMonsterBonus.js';
import BounceMonsterBonus from '/imports/game/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/game/bonus/CloakedMonsterBonus.js';
import RandomBonus from '/imports/game/bonus/RandomBonus.js';
import { Constants } from '/imports/lib/constants.js';

export default class BonusFactory {

	/**
	 * @param {Game} game
	 * @param {boolean} [excludeRandom=false]
	 * @returns {BaseBonus}
	 */
	static randomBonus(game, excludeRandom) {
		const bonusClass = this.randomBonusKey(excludeRandom);
		const bonus = this.fromClassName(bonusClass, game);

		if (bonus instanceof RandomBonus) {
			bonus.setRandomBonus(this.randomBonus(game, true));
		}

		return bonus;
	}

	/**
	 * @param {boolean} [excludeRandom=false]
	 * @returns {string}
	 */
	static randomBonusKey(excludeRandom) {
		const availableBonuses = [
			Constants.BONUS_SMALL_BALL,
			Constants.BONUS_BIG_BALL,
			Constants.BONUS_INVISIBLE_BALL,
			Constants.BONUS_SMALL_MONSTER,
			Constants.BONUS_BIG_MONSTER,
			Constants.BONUS_BIG_JUMP_MONSTER,
			Constants.BONUS_SLOW_MONSTER,
			Constants.BONUS_FAST_MONSTER,
			Constants.BONUS_FREEZE_MONSTER,
			Constants.BONUS_REVERSE_MOVE_MONSTER,
			Constants.BONUS_INVISIBLE_MONSTER,
			Constants.BONUS_INVISIBLE_OPPONENT_MONSTER,
			Constants.BONUS_CLOUD,
			Constants.BONUS_NO_JUMP_MONSTER,
			Constants.BONUS_BOUNCE_MONSTER,
			Constants.BONUS_CLOAKED_MONSTER
		];

		if (!excludeRandom) {
			availableBonuses.push(Constants.RANDOM_BONUS);
		}

		return Random.choice(availableBonuses);
	}

	/**
	 * @param {string} bonusClass
	 * @param {Game} game
	 * @returns {BaseBonus}
	 */
	static fromClassName(bonusClass, game) {
		switch (bonusClass) {
			case Constants.BONUS_SMALL_BALL:
				return new SmallBallBonus(game, bonusClass);
			case Constants.BONUS_BIG_BALL:
				return new BigBallBonus(game, bonusClass);
			case Constants.BONUS_INVISIBLE_BALL:
				return new InvisibleBallBonus(game, bonusClass);
			case Constants.BONUS_SMALL_MONSTER:
				return new SmallMonsterBonus(game, bonusClass);
			case Constants.BONUS_BIG_MONSTER:
				return new BigMonsterBonus(game, bonusClass);
			case Constants.BONUS_BIG_JUMP_MONSTER:
				return new BigJumpMonsterBonus(game, bonusClass);
			case Constants.BONUS_SLOW_MONSTER:
				return new SlowMonsterBonus(game, bonusClass);
			case Constants.BONUS_FAST_MONSTER:
				return new FastMonsterBonus(game, bonusClass);
			case Constants.BONUS_FREEZE_MONSTER:
				return new FreezeMonsterBonus(game, bonusClass);
			case Constants.BONUS_REVERSE_MOVE_MONSTER:
				return new ReverseMoveMonsterBonus(game, bonusClass);
			case Constants.BONUS_INVISIBLE_MONSTER:
				return new InvisibleMonsterBonus(game, bonusClass);
			case Constants.BONUS_INVISIBLE_OPPONENT_MONSTER:
				return new InvisibleOpponentMonsterBonus(game, bonusClass);
			case Constants.BONUS_CLOUD:
				return new CloudBonus(game, bonusClass);
			case Constants.BONUS_NO_JUMP_MONSTER:
				return new NoJumpMonsterBonus(game, bonusClass);
			case Constants.BONUS_BOUNCE_MONSTER:
				return new BounceMonsterBonus(game, bonusClass);
			case Constants.BONUS_CLOAKED_MONSTER:
				return new CloakedMonsterBonus(game, bonusClass);
			case Constants.RANDOM_BONUS:
				return new RandomBonus(game, bonusClass);
		}

		throw 'Inexistent bonus: ' + bonusClass;
	}

	static fromData(data, game) {
		const bonus = this.fromClassName(data.bonusClassName, game);

		if (bonus instanceof RandomBonus) {
			bonus.setRandomBonus(this.fromClassName(data.randomBonusClassName, game));
		}

		return bonus;
	}

}
