import BigBallBonus from './bonus/BigBallBonus';
import BigJumpMonsterBonus from './bonus/BigJumpMonsterBonus';
import BigMonsterBonus from './bonus/BigMonsterBonus';
import BonusRepellentMonsterBonus from './bonus/BonusRepellentMonsterBonus';
import BounceMonsterBonus from './bonus/BounceMonsterBonus';
import CloakedMonsterBonus from './bonus/CloakedMonsterBonus';
import CloudBonus from './bonus/CloudBonus';
import CureBonus from './bonus/CureBonus';
import FastMonsterBonus from './bonus/FastMonsterBonus';
import FreezeMonsterBonus from './bonus/FreezeMonsterBonus';
import HighGravity from './bonus/HighGravity';
import InstantDeathBonus from './bonus/InstantDeathBonus';
import InvincibleInstantDeathBonus from './bonus/InvincibleInstantDeathBonus';
import InvincibleMonsterBonus from './bonus/InvincibleMonsterBonus';
import InvisibleBallBonus from './bonus/InvisibleBallBonus';
import InvisibleMonsterBonus from './bonus/InvisibleMonsterBonus';
import InvisibleOpponentMonsterBonus from './bonus/InvisibleOpponentMonsterBonus';
import LowGravity from './bonus/LowGravity';
import NoJumpMonsterBonus from './bonus/NoJumpMonsterBonus';
import NothingBonus from './bonus/NothingBonus';
import PoisonBonus from './bonus/PoisonBonus';
import RandomBonus from './bonus/RandomBonus';
import ResetBallHitCountBonus from './bonus/ResetBallHitCountBonus';
import ReverseMoveMonsterBonus from './bonus/ReverseMoveMonsterBonus';
import ReviveBonus from './bonus/ReviveBonus';
import RobotBonus from './bonus/RobotBonus';
import ShapeShiftMonsterBonus from './bonus/ShapeShiftMonsterBonus';
import SlowMonsterBonus from './bonus/SlowMonsterBonus';
import SmallBallBonus from './bonus/SmallBallBonus';
import SmallMonsterBonus from './bonus/SmallMonsterBonus';
import SmokeBombBonus from './bonus/SmokeBombBonus';
import UnfreezeMonsterBonus from './bonus/UnfreezeMonsterBonus';
import {
	BONUS_BIG_BALL,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BIG_MONSTER,
	BONUS_BOUNCE_MONSTER,
	BONUS_CLEAR_BONUSES,
	BONUS_CLOAKED_MONSTER,
	BONUS_CLONE_BALL,
	BONUS_CLOUD,
	BONUS_CURE,
	BONUS_FAST_MONSTER,
	BONUS_FREEZE_MONSTER,
	BONUS_HIGH_GRAVITY,
	BONUS_INSTANT_DEATH,
	BONUS_INVINCIBLE_INSTANT_DEATH,
	BONUS_INVINCIBLE_MONSTER,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER,
	BONUS_LOW_GRAVITY,
	BONUS_NO_JUMP_MONSTER,
	BONUS_NOTHING,
	BONUS_POISON,
	BONUS_RANDOM,
	BONUS_REPELLENT,
	BONUS_RESET_BALL_HIT_COUNT,
	BONUS_REVERSE_MOVE_MONSTER,
	BONUS_REVIVE,
	BONUS_ROBOT,
	BONUS_SHAPE_SHIFT,
	BONUS_SLOW_MONSTER,
	BONUS_SMALL_BALL,
	BONUS_SMALL_MONSTER,
	BONUS_SMOKE_BOMB,
	BONUS_UNFREEZE_MONSTER
} from './bonusConstants';
import GameConfiguration from "./configuration/GameConfiguration";
import {Random} from 'meteor/random';
import {BonusStreamData} from "./bonus/data/BonusStreamData";
import BaseBonus from "./bonus/BaseBonus";
import CloneBallBonus from "./bonus/CloneBallBonus";
import ClearBonuses from "./bonus/ClearBonuses";

export default class BonusFactory {
	static randomBonus(gameConfiguration: GameConfiguration): BaseBonus {
		let availableBonuses = this.availableBonuses();

		if (gameConfiguration.overridesAvailableBonuses()) {
			availableBonuses = gameConfiguration.availableBonuses();
		}

		const bonus = this.fromClassName(Random.choice(availableBonuses));

		if (bonus instanceof RandomBonus) {
			let availableBonusesForRandom = this.availableBonusesForRandom();

			if (gameConfiguration.overridesAvailableBonusesForRandom()) {
				availableBonusesForRandom = gameConfiguration.availableBonusesForRandom();
			}

			bonus.setRandomBonus(this.fromClassName(Random.choice(availableBonusesForRandom)));
		}

		return bonus;
	}

	static availableBonuses(): string[] {
		return [
			BONUS_SMALL_BALL,
			BONUS_BIG_BALL,
			BONUS_INVISIBLE_BALL,
			BONUS_CLONE_BALL,
			BONUS_LOW_GRAVITY,
			BONUS_HIGH_GRAVITY,
			BONUS_NOTHING,
			BONUS_CLEAR_BONUSES,
			BONUS_ROBOT,
			BONUS_SMALL_MONSTER,
			BONUS_BIG_MONSTER,
			BONUS_BIG_JUMP_MONSTER,
			BONUS_SLOW_MONSTER,
			BONUS_FAST_MONSTER,
			BONUS_FREEZE_MONSTER,
			BONUS_REVERSE_MOVE_MONSTER,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_INVINCIBLE_INSTANT_DEATH,
			BONUS_POISON,
			BONUS_REPELLENT,
			BONUS_CLOUD,
			BONUS_NO_JUMP_MONSTER,
			BONUS_BOUNCE_MONSTER,
			BONUS_CLOAKED_MONSTER,
			BONUS_SHAPE_SHIFT,
			BONUS_SMOKE_BOMB,
			BONUS_RANDOM
		];
	}

	static availableBonusesForRandom(): string[] {
		return [
			BONUS_SMALL_BALL,
			BONUS_BIG_BALL,
			BONUS_INVISIBLE_BALL,
			BONUS_CLONE_BALL,
			BONUS_LOW_GRAVITY,
			BONUS_HIGH_GRAVITY,
			BONUS_CLEAR_BONUSES,
			BONUS_ROBOT,
			BONUS_SMALL_MONSTER,
			BONUS_BIG_MONSTER,
			BONUS_BIG_JUMP_MONSTER,
			BONUS_SLOW_MONSTER,
			BONUS_FAST_MONSTER,
			BONUS_FREEZE_MONSTER,
			BONUS_REVERSE_MOVE_MONSTER,
			BONUS_INVISIBLE_MONSTER,
			BONUS_INVISIBLE_OPPONENT_MONSTER,
			BONUS_POISON,
			BONUS_REPELLENT,
			BONUS_CLOUD,
			BONUS_NO_JUMP_MONSTER,
			BONUS_BOUNCE_MONSTER,
			BONUS_CLOAKED_MONSTER,
			BONUS_SHAPE_SHIFT,
			BONUS_SMOKE_BOMB,
			BONUS_INVINCIBLE_MONSTER,
		];
	}

	static fromClassName(bonusClass: string): BaseBonus {
		switch (bonusClass) {
			case BONUS_SMALL_BALL:
				return new SmallBallBonus(bonusClass);
			case BONUS_BIG_BALL:
				return new BigBallBonus(bonusClass);
			case BONUS_INVISIBLE_BALL:
				return new InvisibleBallBonus(bonusClass);
			case BONUS_CLONE_BALL:
				return new CloneBallBonus(bonusClass);
			case BONUS_LOW_GRAVITY:
				return new LowGravity(bonusClass);
			case BONUS_HIGH_GRAVITY:
				return new HighGravity(bonusClass);
			case BONUS_NOTHING:
				return new NothingBonus(bonusClass);
			case BONUS_CLEAR_BONUSES:
				return new ClearBonuses(bonusClass);
			case BONUS_SMALL_MONSTER:
				return new SmallMonsterBonus(bonusClass);
			case BONUS_BIG_MONSTER:
				return new BigMonsterBonus(bonusClass);
			case BONUS_BIG_JUMP_MONSTER:
				return new BigJumpMonsterBonus(bonusClass);
			case BONUS_SLOW_MONSTER:
				return new SlowMonsterBonus(bonusClass);
			case BONUS_FAST_MONSTER:
				return new FastMonsterBonus(bonusClass);
			case BONUS_FREEZE_MONSTER:
				return new FreezeMonsterBonus(bonusClass);
			case BONUS_UNFREEZE_MONSTER:
				return new UnfreezeMonsterBonus(bonusClass);
			case BONUS_REVERSE_MOVE_MONSTER:
				return new ReverseMoveMonsterBonus(bonusClass);
			case BONUS_INVINCIBLE_MONSTER:
				return new InvincibleMonsterBonus(bonusClass);
			case BONUS_REPELLENT:
				return new BonusRepellentMonsterBonus(bonusClass);
			case BONUS_INVISIBLE_MONSTER:
				return new InvisibleMonsterBonus(bonusClass);
			case BONUS_INVISIBLE_OPPONENT_MONSTER:
				return new InvisibleOpponentMonsterBonus(bonusClass);
			case BONUS_CLOUD:
				return new CloudBonus(bonusClass);
			case BONUS_NO_JUMP_MONSTER:
				return new NoJumpMonsterBonus(bonusClass);
			case BONUS_BOUNCE_MONSTER:
				return new BounceMonsterBonus(bonusClass);
			case BONUS_CLOAKED_MONSTER:
				return new CloakedMonsterBonus(bonusClass);
			case BONUS_SHAPE_SHIFT:
				return new ShapeShiftMonsterBonus(bonusClass);
			case BONUS_SMOKE_BOMB:
				return new SmokeBombBonus(bonusClass);
			case BONUS_INSTANT_DEATH:
				return new InstantDeathBonus(bonusClass);
			case BONUS_REVIVE:
				return new ReviveBonus(bonusClass);
			case BONUS_INVINCIBLE_INSTANT_DEATH:
				return new InvincibleInstantDeathBonus(bonusClass);
			case BONUS_POISON:
				return new PoisonBonus(bonusClass);
			case BONUS_CURE:
				return new CureBonus(bonusClass);
			case BONUS_ROBOT:
				return new RobotBonus(bonusClass);
			case BONUS_RESET_BALL_HIT_COUNT:
				return new ResetBallHitCountBonus(bonusClass);
			case BONUS_RANDOM:
				return new RandomBonus(bonusClass);
		}

		throw 'Inexistent bonus: ' + bonusClass;
	}

	static fromData(data: BonusStreamData): any {
		const bonus = this.fromClassName(data.bonusClass);

		if (bonus.hasRandomBonus()) {
			bonus.setRandomBonus(this.fromClassName(data.randomBonusClass));
		}

		return bonus;
	}
}
