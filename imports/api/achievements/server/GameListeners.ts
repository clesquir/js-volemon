import AllBonusesInAGame from './listeners/AllBonusesInAGame';
import BattleOfTheGiants from './listeners/BattleOfTheGiants';
import BlankScreen from './listeners/BlankScreen';
import BonusesInAGame from './listeners/BonusesInAGame';
import BonusesInALifetime from './listeners/BonusesInALifetime';
import BonusesInAPoint from './listeners/BonusesInAPoint';
import CarefullyRandomlyPicked from './listeners/CarefullyRandomlyPicked';
import ConsecutiveDaysPlayed from './listeners/ConsecutiveDaysPlayed';
import ConsecutiveLostGames from './listeners/ConsecutiveLostGames';
import ConsecutiveWonGames from './listeners/ConsecutiveWonGames';
import CrushingMetal from './listeners/CrushingMetal';
import DavidVsGoliath from './listeners/DavidVsGoliath';
import FortuneTeller from './listeners/FortuneTeller';
import FullStop from './listeners/FullStop';
import GamesPlayed from './listeners/GamesPlayed';
import GamesWonUnderAMinute from './listeners/GamesWonUnderAMinute';
import GamesWonWithXShape from './listeners/GamesWonWithXShape';
import GameTime from './listeners/GameTime';
import GoneButNotForgotten from './listeners/GoneButNotForgotten';
import HitTheCeiling from './listeners/HitTheCeiling';
import HowToTieATie from './listeners/HowToTieATie';
import Intoxicated from './listeners/Intoxicated';
import InvincibleInALifetime from './listeners/InvincibleInALifetime';
import InvisibleInAGame from './listeners/InvisibleInAGame';
import InvisibleInALifetime from './listeners/InvisibleInALifetime';
import InvisibleInAPoint from './listeners/InvisibleInAPoint';
import IWasThereWaiting from './listeners/IWasThereWaiting';
import Listener from './listeners/Listener';
import MisterClean from './listeners/MisterClean';
import Ninja from './listeners/Ninja';
import PauseInAGame from './listeners/PauseInAGame';
import PauseInALifetime from './listeners/PauseInALifetime';
import PauseInAPoint from './listeners/PauseInAPoint';
import PointTime from './listeners/PointTime';
import Rakshasa from './listeners/Rakshasa';
import RandomInAGame from './listeners/RandomInAGame';
import Shutouts from './listeners/Shutouts';
import SimultaneousActivatedBonuses from './listeners/SimultaneousActivatedBonuses';
import Snoozer from './listeners/Snoozer';
import SpringCleaning from './listeners/SpringCleaning';
import SteelPracticing from './listeners/SteelPracticing';
import SuicidalTendencies from './listeners/SuicidalTendencies';
import TeenyTinyWorld from './listeners/TeenyTinyWorld';
import TheyAreAllOver from './listeners/TheyAreAllOver';
import ToTheSky from './listeners/ToTheSky';
import TripleColon from './listeners/TripleColon';
import Undesirable from './listeners/Undesirable';
import Untouchable from './listeners/Untouchable';
import YouHaveGotBalls from './listeners/YouHaveGotBalls';
import {Games} from '../../games/games';
import {Players} from '../../games/players';

export default class GameListeners {
	private readonly gameId: string;
	private listeners: Listener[];

	constructor(gameId: string) {
		this.gameId = gameId;
		/** @var {Listener[]} */
		this.listeners = [];
	}

	init() {
	}

	start() {
		const game = Games.findOne({_id: this.gameId});

		if (!game) {
			return;
		}

		const players = Players.find({gameId: this.gameId});

		players.forEach((player: {userId: string}) => {
			this.listeners.push((new PointTime()).forGame(this.gameId, player.userId));
			this.listeners.push((new GameTime()).forGame(this.gameId, player.userId));
			this.listeners.push((new GamesPlayed()).forGame(this.gameId, player.userId));
			this.listeners.push((new Shutouts()).forGame(this.gameId, player.userId));
			this.listeners.push((new ConsecutiveWonGames()).forGame(this.gameId, player.userId));
			this.listeners.push((new ConsecutiveDaysPlayed()).forGame(this.gameId, player.userId));
			this.listeners.push((new PauseInAPoint()).forGame(this.gameId, player.userId));
			this.listeners.push((new PauseInAGame()).forGame(this.gameId, player.userId));
			this.listeners.push((new PauseInALifetime()).forGame(this.gameId, player.userId));
			this.listeners.push((new InvisibleInAPoint()).forGame(this.gameId, player.userId));
			this.listeners.push((new InvisibleInAGame()).forGame(this.gameId, player.userId));
			this.listeners.push((new InvisibleInALifetime()).forGame(this.gameId, player.userId));
			this.listeners.push((new BonusesInAPoint()).forGame(this.gameId, player.userId));
			this.listeners.push((new BonusesInAGame()).forGame(this.gameId, player.userId));
			this.listeners.push((new BonusesInALifetime()).forGame(this.gameId, player.userId));
			this.listeners.push((new SimultaneousActivatedBonuses()).forGame(this.gameId, player.userId));
			this.listeners.push((new AllBonusesInAGame()).forGame(this.gameId, player.userId));
			this.listeners.push((new GamesWonWithXShape()).forGame(this.gameId, player.userId));
			this.listeners.push((new InvincibleInALifetime()).forGame(this.gameId, player.userId));
			this.listeners.push((new ConsecutiveLostGames()).forGame(this.gameId, player.userId));
			this.listeners.push((new GamesWonUnderAMinute()).forGame(this.gameId, player.userId));
			this.listeners.push((new RandomInAGame()).forGame(this.gameId, player.userId));
			this.listeners.push((new HowToTieATie()).forGame(this.gameId, player.userId));
			this.listeners.push((new BattleOfTheGiants()).forGame(this.gameId, player.userId));
			this.listeners.push((new Ninja()).forGame(this.gameId, player.userId));
			this.listeners.push((new IWasThereWaiting()).forGame(this.gameId, player.userId));
			this.listeners.push((new ToTheSky()).forGame(this.gameId, player.userId));
			this.listeners.push((new BlankScreen()).forGame(this.gameId, player.userId));
			this.listeners.push((new DavidVsGoliath()).forGame(this.gameId, player.userId));
			this.listeners.push((new Snoozer()).forGame(this.gameId, player.userId));
			this.listeners.push((new CarefullyRandomlyPicked()).forGame(this.gameId, player.userId));
			this.listeners.push((new Rakshasa()).forGame(this.gameId, player.userId));
			this.listeners.push((new TripleColon()).forGame(this.gameId, player.userId));
			this.listeners.push((new FullStop()).forGame(this.gameId, player.userId));
			this.listeners.push((new Undesirable()).forGame(this.gameId, player.userId));
			this.listeners.push((new TeenyTinyWorld()).forGame(this.gameId, player.userId));
			this.listeners.push((new TheyAreAllOver()).forGame(this.gameId, player.userId));
			this.listeners.push((new SuicidalTendencies()).forGame(this.gameId, player.userId));
			this.listeners.push((new Intoxicated()).forGame(this.gameId, player.userId));
			this.listeners.push((new GoneButNotForgotten()).forGame(this.gameId, player.userId));
			this.listeners.push((new CrushingMetal()).forGame(this.gameId, player.userId));
			this.listeners.push((new SteelPracticing()).forGame(this.gameId, player.userId));
			this.listeners.push((new Untouchable()).forGame(this.gameId, player.userId));
			this.listeners.push((new HitTheCeiling()).forGame(this.gameId, player.userId));
			this.listeners.push((new YouHaveGotBalls()).forGame(this.gameId, player.userId));
			this.listeners.push((new FortuneTeller()).forGame(this.gameId, player.userId));
			this.listeners.push((new SpringCleaning()).forGame(this.gameId, player.userId));
			this.listeners.push((new MisterClean()).forGame(this.gameId, player.userId));
		});
	}

	destroy() {
		this.listeners.forEach(function(achievement: Listener) {
			achievement.destroy();
		});

		this.listeners = [];
	}
}
