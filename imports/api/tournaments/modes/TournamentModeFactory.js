import {
	TOURNAMENT_MODE_BIG_DRUNK,
	TOURNAMENT_MODE_BLANK_SCREEN,
	TOURNAMENT_MODE_BONUS_DURATION,
	TOURNAMENT_MODE_BONUS_OVERRIDE,
	TOURNAMENT_MODE_CATCH_ME_IF_YOU_CAN,
	TOURNAMENT_MODE_CLASSIC,
	TOURNAMENT_MODE_FOOTBALL_FIELD,
	TOURNAMENT_MODE_HARDCORE,
	TOURNAMENT_MODE_HIDDEN_SHAPE,
	TOURNAMENT_MODE_JUPITER_GRAVITY,
	TOURNAMENT_MODE_MASSIVE_HARDCORE_BLIND_BULLETPROOF,
	TOURNAMENT_MODE_MOON_GRAVITY,
	TOURNAMENT_MODE_NO_BONUSES,
	TOURNAMENT_MODE_NOT_ENOUGH_SPACE,
	TOURNAMENT_MODE_NOTHING_BONUS,
	TOURNAMENT_MODE_PAUSE_PLAY,
	TOURNAMENT_MODE_PLAYER_VELOCITY,
	TOURNAMENT_MODE_RANDOM_BONUSES,
	TOURNAMENT_MODE_SHAPE_SHIFTER,
	TOURNAMENT_MODE_SMOKE_BOMB,
	TOURNAMENT_MODE_SPAGHETTI_ON_THE_CARPET,
	TOURNAMENT_MODE_SUDDEN_DEATH,
	TOURNAMENT_MODE_SUPER_BOUNCE_WALLS,
	TOURNAMENT_MODE_TALL_NET,
	TOURNAMENT_MODE_TEENY_TINY_WORLD,
	TOURNAMENT_MODE_TINY_NET
} from '/imports/api/tournaments/tournamentModesConstants.js';
import BigDrunk from './BigDrunk';
import BlankScreen from './BlankScreen';
import BonusDuration from './BonusDuration';
import BonusOverride from './BonusOverride';
import CatchMeIfYouCan from './CatchMeIfYouCan';
import Classic from './Classic';
import FootballField from './FootballField';
import Hardcore from './Hardcore';
import HiddenShape from './HiddenShape';
import JupiterGravity from './JupiterGravity';
import MassiveHardcoreBlindBulletproof from './MassiveHardcoreBlindBulletproof';
import MoonGravity from './MoonGravity';
import NoBonuses from './NoBonuses';
import NotEnoughSpace from './NotEnoughSpace';
import NothingBonus from './NothingBonus';
import PausePlay from './PausePlay';
import PlayerVelocity from './PlayerVelocity';
import RandomBonuses from './RandomBonuses';
import ShapeShifter from './ShapeShifter';
import SmokeBomb from './SmokeBomb';
import SpaghettiOnTheCarpet from './SpaghettiOnTheCarpet';
import SuddenDeath from './SuddenDeath';
import SuperBounceWalls from './SuperBounceWalls';
import TallNet from './TallNet';
import TeenyTinyWorld from './TeenyTinyWorld';
import TinyNet from './TinyNet';

export default class TournamentModeFactory {
	/**
	 * @param id
	 * @returns {Classic}
	 */
	static fromId(id) {
		switch(id) {
			case TOURNAMENT_MODE_CLASSIC:
				return new Classic();
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
			case TOURNAMENT_MODE_TINY_NET:
				return new TinyNet();
			case TOURNAMENT_MODE_TALL_NET:
				return new TallNet();
			case TOURNAMENT_MODE_TEENY_TINY_WORLD:
				return new TeenyTinyWorld();
			case TOURNAMENT_MODE_BLANK_SCREEN:
				return new BlankScreen();
			case TOURNAMENT_MODE_CATCH_ME_IF_YOU_CAN:
				return new CatchMeIfYouCan();
			case TOURNAMENT_MODE_FOOTBALL_FIELD:
				return new FootballField();
			case TOURNAMENT_MODE_NOT_ENOUGH_SPACE:
				return new NotEnoughSpace();
			case TOURNAMENT_MODE_PAUSE_PLAY:
				return new PausePlay();
			case TOURNAMENT_MODE_BONUS_DURATION:
				return new BonusDuration();
			case TOURNAMENT_MODE_BONUS_OVERRIDE:
				return new BonusOverride();
			case TOURNAMENT_MODE_PLAYER_VELOCITY:
				return new PlayerVelocity();
		}

		throw `The tournament mode ${id} doesn't exist.`;
	}
}
