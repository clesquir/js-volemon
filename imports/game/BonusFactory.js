import {Random} from 'meteor/random';
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
import InvincibleMonsterBonus from '/imports/game/bonus/InvincibleMonsterBonus.js';
import InvisibleMonsterBonus from '/imports/game/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/game/bonus/InvisibleOpponentMonsterBonus.js';
import CloudBonus from '/imports/game/bonus/CloudBonus.js';
import NoJumpMonsterBonus from '/imports/game/bonus/NoJumpMonsterBonus.js';
import BounceMonsterBonus from '/imports/game/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/game/bonus/CloakedMonsterBonus.js';
import RandomBonus from '/imports/game/bonus/RandomBonus.js';
import {
	BONUS_SMALL_BALL,
	BONUS_BIG_BALL,
	BONUS_INVISIBLE_BALL,
	BONUS_SMALL_MONSTER,
	BONUS_BIG_MONSTER,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_SLOW_MONSTER,
	BONUS_FAST_MONSTER,
	BONUS_FREEZE_MONSTER,
	BONUS_REVERSE_MOVE_MONSTER,
	BONUS_INVINCIBLE_MONSTER,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER,
	BONUS_CLOUD,
	BONUS_NO_JUMP_MONSTER,
	BONUS_BOUNCE_MONSTER,
	BONUS_CLOAKED_MONSTER,
	BONUS_RANDOM_BONUS
} from '/imports/api/games/bonusConstants.js';

export default class BonusFactory {

	/**
	 * @param {Game} game
	 * @returns {BaseBonus}
	 */
	static randomBonus(game) {
		const bonus = this.fromClassName(this.randomBonusKey(), game);

		if (bonus instanceof RandomBonus) {
			bonus.setRandomBonus(
				this.fromClassName(
					Random.choice(this.availableBonusesForRandom()),
					game
				)
			);
		}

		return bonus;
	}

	/**
	 * @returns {string}
	 */
	static randomBonusKey() {
		const availableBonuses = this.availableBonuses().concat(
			[
				BONUS_RANDOM_BONUS
			]
		);

		return Random.choice(availableBonuses);
	}

	/**
	 * @returns {string[]}
	 */
	static availableBonuses() {
		return [
			BONUS_SMALL_BALL,
			BONUS_BIG_BALL,
			BONUS_INVISIBLE_BALL,
			BONUS_SMALL_MONSTER,
			BONUS_BIG_MONSTER,
			BONUS_BIG_JUMP_MONSTER,
			BONUS_SLOW_MONSTER,
			BONUS_FAST_MONSTER,
			BONUS_FREEZE_MONSTER,
			BONUS_REVERSE_MOVE_MONSTER,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_CLOUD,
			BONUS_NO_JUMP_MONSTER,
			BONUS_BOUNCE_MONSTER,
			BONUS_CLOAKED_MONSTER
		];
	}

	static availableBonusesForRandom() {
		return this.availableBonuses().concat(
			[
				BONUS_INVINCIBLE_MONSTER
			]
		);
	}

	/**
	 * @param {string} bonusClass
	 * @param {Game} game
	 * @returns {BaseBonus}
	 */
	static fromClassName(bonusClass, game) {
		switch (bonusClass) {
			case BONUS_SMALL_BALL:
				return new SmallBallBonus(game, bonusClass);
			case BONUS_BIG_BALL:
				return new BigBallBonus(game, bonusClass);
			case BONUS_INVISIBLE_BALL:
				return new InvisibleBallBonus(game, bonusClass);
			case BONUS_SMALL_MONSTER:
				return new SmallMonsterBonus(game, bonusClass);
			case BONUS_BIG_MONSTER:
				return new BigMonsterBonus(game, bonusClass);
			case BONUS_BIG_JUMP_MONSTER:
				return new BigJumpMonsterBonus(game, bonusClass);
			case BONUS_SLOW_MONSTER:
				return new SlowMonsterBonus(game, bonusClass);
			case BONUS_FAST_MONSTER:
				return new FastMonsterBonus(game, bonusClass);
			case BONUS_FREEZE_MONSTER:
				return new FreezeMonsterBonus(game, bonusClass);
			case BONUS_REVERSE_MOVE_MONSTER:
				return new ReverseMoveMonsterBonus(game, bonusClass);
			case BONUS_INVINCIBLE_MONSTER:
				return new InvincibleMonsterBonus(game, bonusClass);
			case BONUS_INVISIBLE_MONSTER:
				return new InvisibleMonsterBonus(game, bonusClass);
			case BONUS_INVISIBLE_OPPONENT_MONSTER:
				return new InvisibleOpponentMonsterBonus(game, bonusClass);
			case BONUS_CLOUD:
				return new CloudBonus(game, bonusClass);
			case BONUS_NO_JUMP_MONSTER:
				return new NoJumpMonsterBonus(game, bonusClass);
			case BONUS_BOUNCE_MONSTER:
				return new BounceMonsterBonus(game, bonusClass);
			case BONUS_CLOAKED_MONSTER:
				return new CloakedMonsterBonus(game, bonusClass);
			case BONUS_RANDOM_BONUS:
				return new RandomBonus(game, bonusClass);
		}

		throw 'Inexistent bonus: ' + bonusClass;
	}

	static fromData(data, game) {
		const bonus = this.fromClassName(data.bonusClass, game);

		if (bonus instanceof RandomBonus) {
			bonus.setRandomBonus(this.fromClassName(data.randomBonusClass, game));
		}

		return bonus;
	}

}
