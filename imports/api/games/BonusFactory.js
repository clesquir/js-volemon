import BigBallBonus from '/imports/api/games/bonus/BigBallBonus.js';
import BigJumpMonsterBonus from '/imports/api/games/bonus/BigJumpMonsterBonus.js';
import BigMonsterBonus from '/imports/api/games/bonus/BigMonsterBonus.js';
import BonusRepellentMonsterBonus from '/imports/api/games/bonus/BonusRepellentMonsterBonus.js';
import BounceMonsterBonus from '/imports/api/games/bonus/BounceMonsterBonus.js';
import CloakedMonsterBonus from '/imports/api/games/bonus/CloakedMonsterBonus.js';
import CloudBonus from '/imports/api/games/bonus/CloudBonus.js';
import CureBonus from '/imports/api/games/bonus/CureBonus.js';
import DrunkMonsterBonus from '/imports/api/games/bonus/DrunkMonsterBonus.js';
import FastMonsterBonus from '/imports/api/games/bonus/FastMonsterBonus.js';
import FreezeMonsterBonus from '/imports/api/games/bonus/FreezeMonsterBonus.js';
import HighGravity from '/imports/api/games/bonus/HighGravity.js';
import InstantDeathBonus from '/imports/api/games/bonus/InstantDeathBonus.js';
import InvincibleMonsterBonus from '/imports/api/games/bonus/InvincibleMonsterBonus.js';
import InvisibleBallBonus from '/imports/api/games/bonus/InvisibleBallBonus.js';
import InvisibleMonsterBonus from '/imports/api/games/bonus/InvisibleMonsterBonus.js';
import InvisibleOpponentMonsterBonus from '/imports/api/games/bonus/InvisibleOpponentMonsterBonus.js';
import JunkFoodMonster from '/imports/api/games/bonus/JunkFoodMonsterBonus.js';
import LowGravity from '/imports/api/games/bonus/LowGravity.js';
import NoJumpMonsterBonus from '/imports/api/games/bonus/NoJumpMonsterBonus.js';
import NothingBonus from '/imports/api/games/bonus/NothingBonus.js';
import PoisonBonus from '/imports/api/games/bonus/PoisonBonus.js';
import RandomBonus from '/imports/api/games/bonus/RandomBonus.js';
import ReverseMoveMonsterBonus from '/imports/api/games/bonus/ReverseMoveMonsterBonus.js';
import ShapeShiftMonsterBonus from '/imports/api/games/bonus/ShapeShiftMonsterBonus.js';
import SlowMonsterBonus from '/imports/api/games/bonus/SlowMonsterBonus.js';
import SmallBallBonus from '/imports/api/games/bonus/SmallBallBonus.js';
import SmallMonsterBonus from '/imports/api/games/bonus/SmallMonsterBonus.js';
import SmokeBombBonus from '/imports/api/games/bonus/SmokeBombBonus.js';
import UnfreezeMonsterBonus from '/imports/api/games/bonus/UnfreezeMonsterBonus.js';
import {
	BONUS_BIG_BALL,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BIG_MONSTER,
	BONUS_BOUNCE_MONSTER,
	BONUS_CLOAKED_MONSTER,
	BONUS_CLOUD,
	BONUS_CURE,
	BONUS_DRUNK_MONSTER,
	BONUS_FAST_MONSTER,
	BONUS_FREEZE_MONSTER,
	BONUS_HIGH_GRAVITY,
	BONUS_INSTANT_DEATH,
	BONUS_INVINCIBLE_MONSTER,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER,
	BONUS_JUNK_FOOD_MONSTER,
	BONUS_LOW_GRAVITY,
	BONUS_NO_JUMP_MONSTER,
	BONUS_NOTHING,
	BONUS_POISON,
	BONUS_RANDOM,
	BONUS_REPELLENT,
	BONUS_REVERSE_MOVE_MONSTER,
	BONUS_SHAPE_SHIFT,
	BONUS_SLOW_MONSTER,
	BONUS_SMALL_BALL,
	BONUS_SMALL_MONSTER,
	BONUS_SMOKE_BOMB,
	BONUS_UNFREEZE_MONSTER
} from '/imports/api/games/bonusConstants.js';
import {Random} from 'meteor/random';

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
					Random.choice(this.availableBonusesForRandom(gameConfiguration)),
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
		let availableBonuses = this.availableBonuses();

		if (gameConfiguration.overridesAvailableBonuses()) {
			availableBonuses = gameConfiguration.availableBonuses();
		}

		let randomBonusKeyList = availableBonuses.concat(
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
			BONUS_LOW_GRAVITY,
			BONUS_HIGH_GRAVITY,
			BONUS_SMALL_MONSTER,
			BONUS_BIG_MONSTER,
			BONUS_BIG_JUMP_MONSTER,
			BONUS_SLOW_MONSTER,
			BONUS_FAST_MONSTER,
			BONUS_FREEZE_MONSTER,
			BONUS_REVERSE_MOVE_MONSTER,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_REPELLENT,
			BONUS_CLOUD,
			BONUS_NO_JUMP_MONSTER,
			BONUS_BOUNCE_MONSTER,
			BONUS_CLOAKED_MONSTER,
			BONUS_SHAPE_SHIFT,
			BONUS_SMOKE_BOMB,
			BONUS_NOTHING
		];
	}

	/**
	 * @param {GameConfiguration} gameConfiguration
	 * @returns {Array.<string>}
	 */
	static availableBonusesForRandom(gameConfiguration) {
		let availableBonuses = this.availableBonuses();

		if (gameConfiguration.overridesAvailableBonuses()) {
			availableBonuses = gameConfiguration.availableBonuses();
		}

		return availableBonuses.concat(
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
			case BONUS_JUNK_FOOD_MONSTER:
				return new JunkFoodMonster(game, bonusClass);
			case BONUS_BIG_JUMP_MONSTER:
				return new BigJumpMonsterBonus(game, bonusClass);
			case BONUS_SLOW_MONSTER:
				return new SlowMonsterBonus(game, bonusClass);
			case BONUS_FAST_MONSTER:
				return new FastMonsterBonus(game, bonusClass);
			case BONUS_FREEZE_MONSTER:
				return new FreezeMonsterBonus(game, bonusClass);
			case BONUS_UNFREEZE_MONSTER:
				return new UnfreezeMonsterBonus(game, bonusClass);
			case BONUS_REVERSE_MOVE_MONSTER:
				return new ReverseMoveMonsterBonus(game, bonusClass);
			case BONUS_INVINCIBLE_MONSTER:
				return new InvincibleMonsterBonus(game, bonusClass);
			case BONUS_REPELLENT:
				return new BonusRepellentMonsterBonus(game, bonusClass);
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
				return new ShapeShiftMonsterBonus(game, bonusClass);
			case BONUS_SMOKE_BOMB:
				return new SmokeBombBonus(game, bonusClass);
			case BONUS_INSTANT_DEATH:
				return new InstantDeathBonus(game, bonusClass);
			case BONUS_DRUNK_MONSTER:
				return new DrunkMonsterBonus(game, bonusClass);
			case BONUS_LOW_GRAVITY:
				return new LowGravity(game, bonusClass);
			case BONUS_HIGH_GRAVITY:
				return new HighGravity(game, bonusClass);
			case BONUS_POISON:
				return new PoisonBonus(game, bonusClass);
			case BONUS_CURE:
				return new CureBonus(game, bonusClass);
			case BONUS_NOTHING:
				return new NothingBonus(game, bonusClass);
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
