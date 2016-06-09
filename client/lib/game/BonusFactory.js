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
			case Constants.BONUS_FREEZE_MONSTER:
				return new FreezeMonsterBonus(game);
			case Constants.BONUS_REVERSE_MOVE_MONSTER:
				return new ReverseMoveMonsterBonus(game);
			case Constants.BONUS_INVISIBILITY_MONSTER:
				return new InvisibilityMonsterBonus(game);
			case Constants.BONUS_CLOUD:
				return new CloudBonus(game);
		}

		throw 'Inexistent bonus';
	}

}
