import Classic from './Classic';
import {
	BONUS_BIG_BALL,
	BONUS_BIG_JUMP_MONSTER,
	BONUS_BIG_MONSTER,
	BONUS_BOUNCE_MONSTER,
	BONUS_CLOAKED_MONSTER,
	BONUS_FAST_MONSTER,
	BONUS_FREEZE_MONSTER,
	BONUS_INVISIBLE_BALL,
	BONUS_INVISIBLE_MONSTER,
	BONUS_INVISIBLE_OPPONENT_MONSTER,
	BONUS_NO_JUMP_MONSTER,
	BONUS_NOTHING,
	BONUS_REVERSE_MOVE_MONSTER,
	BONUS_SHAPE_SHIFT,
	BONUS_SLOW_MONSTER,
	BONUS_SMALL_BALL,
	BONUS_SMALL_MONSTER
} from '/imports/api/games/bonusConstants.js';

export const BONUS_SPAWN_FREQUENCY = 5000;

export default class NotEnoughSpace extends Classic {
	overridesAvailableBonuses() {
		return true;
	}

	availableBonuses() {
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
			BONUS_NO_JUMP_MONSTER,
			BONUS_BOUNCE_MONSTER,
			BONUS_CLOAKED_MONSTER,
			BONUS_SHAPE_SHIFT,
			BONUS_NOTHING
		];
	}

	overridesBonusSpawnInitialMinimumFrequence() {
		return true;
	}

	bonusSpawnInitialMinimumFrequence() {
		return BONUS_SPAWN_FREQUENCY;
	}

	overridesBonusSpawnInitialMaximumFrequence() {
		return true;
	}

	bonusSpawnInitialMaximumFrequence() {
		return BONUS_SPAWN_FREQUENCY;
	}

	overridesNetHeight() {
		return true;
	}

	netHeight() {
		return 75;
	}

	overridesLevelSize() {
		return true;
	}

	levelSize() {
		return {
			width: 630,
			height: 420
		};
	}
}
