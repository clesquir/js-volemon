import SmallBallBonus from '/client/lib/game/bonus/SmallBallBonus.js';
import BigBallBonus from '/client/lib/game/bonus/BigBallBonus.js';
import BigMonsterBonus from '/client/lib/game/bonus/BigMonsterBonus.js';
import SmallMonsterBonus from '/client/lib/game/bonus/SmallMonsterBonus.js';

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
			case Constants.BONUS_BIG_MONSTER:
				return new BigMonsterBonus(game);
			case Constants.BONUS_SMALL_MONSTER:
				return new SmallMonsterBonus(game);
		}

		throw 'Inexistent bonus';
	}

}
