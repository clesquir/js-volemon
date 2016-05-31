import SmallBallBonus from '/client/lib/game/bonus/SmallBallBonus.js';
import BigBallBonus from '/client/lib/game/bonus/BigBallBonus.js';
import SmallMonsterBonus from '/client/lib/game/bonus/SmallMonsterBonus.js';
import BigMonsterBonus from '/client/lib/game/bonus/BigMonsterBonus.js';
import BigJumpMonsterBonus from '/client/lib/game/bonus/BigJumpMonsterBonus.js';
import SlowMonsterBonus from '/client/lib/game/bonus/SlowMonsterBonus.js';
import FastMonsterBonus from '/client/lib/game/bonus/FastMonsterBonus.js';

export default class BonusFactory {

	/**
	 * @param value
	 * @param game
	 * @returns {BaseBonus}
	 */
	static getInstance(value, game) {
		switch (value) {
			case Constants.BONUS_SMALL_BALL:
				return new SmallBallBonus(game);
			case Constants.BONUS_BIG_BALL:
				return new BigBallBonus(game);
			case Constants.BONUS_SMALL_MONSTER:
				return new SmallMonsterBonus(game);
			case Constants.BONUS_BIG_MONSTER:
				return new BigMonsterBonus(game);
			case Constants.BONUS_BIG_JUMP_MONSTER:
				return new BigJumpMonsterBonus(game);
			case Constants.BONUS_SLOW_MONSTER:
				return new SlowMonsterBonus(game);
			case Constants.BONUS_FAST_MONSTER:
				return new FastMonsterBonus(game);
		}

		throw 'Inexistent bonus';
	}

}
