import {
	TOURNAMENT_MODE_CLASSIC, TOURNAMENT_MODE_INSTANT_DEATH_BONUS,
	TOURNAMENT_MODE_HARDCORE, TOURNAMENT_MODE_RANDOM_BONUSES, TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SUDDEN_DEATH, TOURNAMENT_MODE_SUPER_BOUNCE_WALLS, TOURNAMENT_MODE_JUPITER_GRAVITY,
	TOURNAMENT_MODE_MOON_GRAVITY, TOURNAMENT_MODE_NO_BONUSES, TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF
} from '/imports/api/tournaments/tournamentModesConstants.js';
import Classic from './Classic';
import InstantDeathBonus from './InstantDeathBonus';
import Hardcore from './Hardcore';
import RandomBonuses from './RandomBonuses';
import SmokeBomb from './SmokeBomb';
import SuddenDeath from './SuddenDeath';
import SuperBounceWalls from './SuperBounceWalls';
import MoonGravity from './MoonGravity';
import JupiterGravity from './JupiterGravity';
import NoBonuses from './NoBonuses';
import MassiveHardcoreBlindBulletproof from '/imports/api/tournaments/modes/MassiveHardcoreBlindBulletproof.js';

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
		}

		throw `The tournament mode ${id} doesn't exist.`;
	}
}
