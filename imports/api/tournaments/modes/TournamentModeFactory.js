import {
	TOURNAMENT_MODE_BIG_DRUNK,
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_HIDDEN_SHAPE,
	TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
	TOURNAMENT_MODE_JUPITER_GRAVITY,
	TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF,
	TOURNAMENT_MODE_MOON_GRAVITY,
	TOURNAMENT_MODE_NO_BONUSES,
	TOURNAMENT_MODE_NOTHING_BONUS,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_SHAPE_SHIFTER,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_SUPER_BOUNCE_WALLS
} from '/imports/api/tournaments/tournamentModesConstants.js';
import BigDrunk from './BigDrunk.js';
import Classic from './Classic';
import Hardcore from './Hardcore';
import HiddenShape from './HiddenShape.js';
import InstantDeathBonus from './InstantDeathBonus';
import JupiterGravity from './JupiterGravity';
import MassiveHardcoreBlindBulletproof from './MassiveHardcoreBlindBulletproof.js';
import MoonGravity from './MoonGravity';
import NoBonuses from './NoBonuses';
import NothingBonus from './NothingBonus.js';
import RandomBonuses from './RandomBonuses';
import ShapeShifter from './ShapeShifter';
import SmokeBomb from './SmokeBomb';
import SpaghettiOnTheCarpet from './SpaghettiOnTheCarpet.js';
import SuddenDeath from './SuddenDeath';
import SuperBounceWalls from './SuperBounceWalls';

export default class TournamentModeFactory {
	static fromId(id) {
		switch(id) {
			case TOURNAMENT_MODE_CLASSIC:
				return new Classic();
			case TOURNAMENT_MODE_INSTANT_DEATH_BONUS:
				return new InstantDeathBonus();
			case TOURNAMENT_MODE_HARDCORE:
				return new Hardcore();
			case TOURNAMENT_MODE_RANDOM_BONUSES:
				return new RandomBonuses();
			case TOURNAMENT_MODE_SMOKE_BOMB:
				return new SmokeBomb();
			case TOURNAMENT_MODE_SUDDEN_DEATH:
				return new SuddenDeath();
			case TOURNAMENT_MODE_SUPER_BOUNCE_WALLS:
				return new SuperBounceWalls();
			case TOURNAMENT_MODE_MOON_GRAVITY:
				return new MoonGravity();
			case TOURNAMENT_MODE_JUPITER_GRAVITY:
				return new JupiterGravity();
			case TOURNAMENT_MODE_NO_BONUSES:
				return new NoBonuses();
			case TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF:
				return new MassiveHardcoreBlindBulletproof();
			case TOURNAMENT_MODE_BIG_DRUNK:
				return new BigDrunk();
			case TOURNAMENT_MODE_HIDDEN_SHAPE:
				return new HiddenShape();
			case TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET:
				return new SpaghettiOnTheCarpet();
			case TOURNAMENT_MODE_NOTHING_BONUS:
				return new NothingBonus();
			case TOURNAMENT_MODE_SHAPE_SHIFTER:
				return new ShapeShifter();
		}

		throw `The tournament mode ${id} doesn't exist.`;
	}
}
