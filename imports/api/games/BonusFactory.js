import {Random} from 'meteor/random';
import SmallBallBonus from '/imports/api/games/bonus/SmallBallBonus.js';
import BigBallBonus from '/imports/api/games/bonus/BigBallBonus.js';
import InvisibleBallBonus from '/imports/api/games/bonus/InvisibleBallBonus.js';
import SmallMonsterBonus from '/imports/api/games/bonus/SmallMonsterBonus.js';
import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import BigJumpMonsterBonus from '/imports/api/games/bonus/BigJumpMonsterBonus.js';
import SlowMonsterBonus from '/imports/api/games/bonus/SlowMonsterBonus.js';
import FastMonsterBonus from '/imports/api/games/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import ReverseMoveMonsterBonus from '/imports/api/games/bonus/ReverseMoveMonsterBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import CloudBonus from '/imports/api/games/bonus/CloudBonus.js';
import NoJumpMonsterBonus from '/imports/api/games/bonus/NoJumpMonsterBonus.js';
import BounceMonsterBonus from '/imports/api/games/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/api/games/bonus/CloakedMonsterBonus.js';
import ShapeShiftBonus from '/imports/api/games/bonus/ShapeShiftBonus.js';
import RandomBonus from '/imports/api/games/bonus/RandomBonus.js';
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
	BONUS_SHAPE_SHIFT,
	BONUS_RANDOM
} from '/imports/api/games/bonusConstants.js';

export default class BonusFactory {

	/**
	 * @param {GameBonus} game
	 * @param {GameConfiguration} gameConfiguration
	 * @returns {BaseBonus}
	 */
	static randomBonus(game, gameConfiguration) {
		const bonus = this.fromClassName(this.randomBonusKey(gameConfiguration), game);

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
	 * @param {GameConfiguration} gameConfiguration
	 * @returns {string}
	 */
	static randomBonusKey(gameConfiguration) {
		let randomBonusKeyList = this.availableBonuses().concat(
			[
				BONUS_RANDOM
			]
		);

		if (gameConfiguration.overridesRandomBonusKeyList()) {
			randomBonusKeyList = gameConfiguration.randomBonusKeyList();
		}

		return Random.choice(randomBonusKeyList);
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
			BONUS_CLOAKED_MONSTER,
			BONUS_SHAPE_SHIFT
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
	 * @param {GameBonus} game
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
			case BONUS_SHAPE_SHIFT:
				return new ShapeShiftBonus(game, bonusClass);
			case BONUS_RANDOM:
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
