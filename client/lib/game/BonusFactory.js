import SmallBallBonus from '/client/lib/game/bonus/SmallBallBonus.js';
import BigBallBonus from '/client/lib/game/bonus/BigBallBonus.js';
import SmallMonsterBonus from '/client/lib/game/bonus/SmallMonsterBonus.js';
import BigMonsterBonus from '/client/lib/game/bonus/BigMonsterBonus.js';
import BigJumpMonsterBonus from '/client/lib/game/bonus/BigJumpMonsterBonus.js';
import SlowMonsterBonus from '/client/lib/game/bonus/SlowMonsterBonus.js';
import FastMonsterBonus from '/client/lib/game/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/client/lib/game/bonus/FreezeMonsterBonus.js';
import ReverseMoveMonsterBonus from '/client/lib/game/bonus/ReverseMoveMonsterBonus.js';
import InvisibilityMonsterBonus from '/client/lib/game/bonus/InvisibilityMonsterBonus.js';
import CloudBonus from '/client/lib/game/bonus/CloudBonus.js';
import { Constants } from '/lib/constants.js';

export default class BonusFactory {
	
	static getRandomBonusKey() {
		return Random.choice([
			Constants.BONUS_SMALL_BALL,
			Constants.BONUS_BIG_BALL,
			Constants.BONUS_SMALL_MONSTER,
			Constants.BONUS_BIG_MONSTER,
			Constants.BONUS_BIG_JUMP_MONSTER,
			Constants.BONUS_SLOW_MONSTER,
			Constants.BONUS_FAST_MONSTER,
			Constants.BONUS_FREEZE_MONSTER,
			Constants.BONUS_REVERSE_MOVE_MONSTER,
			Constants.BONUS_INVISIBILITY_MONSTER,
			Constants.BONUS_CLOUD
		]);
	}

	/**
	 * @param bonusClass
	 * @param game
	 * @returns {BaseBonus}
	 */
	static getInstance(bonusClass, game) {
		switch (bonusClass) {
			case Constants.BONUS_SMALL_BALL:
				return new SmallBallBonus(game, bonusClass);
			case Constants.BONUS_BIG_BALL:
				return new BigBallBonus(game, bonusClass);
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
			case Constants.BONUS_INVISIBILITY_MONSTER:
				return new InvisibilityMonsterBonus(game, bonusClass);
			case Constants.BONUS_CLOUD:
				return new CloudBonus(game, bonusClass);
		}

		throw 'Inexistent bonus';
	}

}
