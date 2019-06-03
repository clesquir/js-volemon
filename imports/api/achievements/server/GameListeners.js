import AllBonusesInAGame from '/imports/api/achievements/server/listeners/AllBonusesInAGame';
import BattleOfTheGiants from '/imports/api/achievements/server/listeners/BattleOfTheGiants';
import BlankScreen from '/imports/api/achievements/server/listeners/BlankScreen';
import BonusesInAGame from '/imports/api/achievements/server/listeners/BonusesInAGame';
import BonusesInALifetime from '/imports/api/achievements/server/listeners/BonusesInALifetime';
import BonusesInAPoint from '/imports/api/achievements/server/listeners/BonusesInAPoint';
import CarefullyRandomlyPicked from '/imports/api/achievements/server/listeners/CarefullyRandomlyPicked';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed';
import ConsecutiveLostGames from '/imports/api/achievements/server/listeners/ConsecutiveLostGames';
import ConsecutiveWonGames from '/imports/api/achievements/server/listeners/ConsecutiveWonGames';
import CrushingMetal from '/imports/api/achievements/server/listeners/CrushingMetal';
import DavidVsGoliath from '/imports/api/achievements/server/listeners/DavidVsGoliath';
import FortuneTeller from '/imports/api/achievements/server/listeners/FortuneTeller';
import FullStop from '/imports/api/achievements/server/listeners/FullStop';
import GamesPlayed from '/imports/api/achievements/server/listeners/GamesPlayed';
import GamesWonUnderAMinute from '/imports/api/achievements/server/listeners/GamesWonUnderAMinute';
import GamesWonWithXShape from '/imports/api/achievements/server/listeners/GamesWonWithXShape';
import GameTime from '/imports/api/achievements/server/listeners/GameTime';
import GoneButNotForgotten from '/imports/api/achievements/server/listeners/GoneButNotForgotten';
import HitTheCeiling from '/imports/api/achievements/server/listeners/HitTheCeiling';
import HowToTieATie from '/imports/api/achievements/server/listeners/HowToTieATie';
import Intoxicated from '/imports/api/achievements/server/listeners/Intoxicated';
import InvincibleInALifetime from '/imports/api/achievements/server/listeners/InvincibleInALifetime';
import InvisibleInAGame from '/imports/api/achievements/server/listeners/InvisibleInAGame';
import InvisibleInALifetime from '/imports/api/achievements/server/listeners/InvisibleInALifetime';
import InvisibleInAPoint from '/imports/api/achievements/server/listeners/InvisibleInAPoint';
import IWasThereWaiting from '/imports/api/achievements/server/listeners/IWasThereWaiting';
import Ninja from '/imports/api/achievements/server/listeners/Ninja';
import PauseInAGame from '/imports/api/achievements/server/listeners/PauseInAGame';
import PauseInALifetime from '/imports/api/achievements/server/listeners/PauseInALifetime';
import PauseInAPoint from '/imports/api/achievements/server/listeners/PauseInAPoint';
import PointTime from '/imports/api/achievements/server/listeners/PointTime';
import Rakshasa from '/imports/api/achievements/server/listeners/Rakshasa';
import RandomInAGame from '/imports/api/achievements/server/listeners/RandomInAGame';
import Shutouts from '/imports/api/achievements/server/listeners/Shutouts';
import SimultaneousActivatedBonuses from '/imports/api/achievements/server/listeners/SimultaneousActivatedBonuses';
import Snoozer from '/imports/api/achievements/server/listeners/Snoozer';
import SteelPracticing from '/imports/api/achievements/server/listeners/SteelPracticing';
import SuicidalTendencies from '/imports/api/achievements/server/listeners/SuicidalTendencies';
import TeenyTinyWorld from '/imports/api/achievements/server/listeners/TeenyTinyWorld';
import TheyAreAllOver from '/imports/api/achievements/server/listeners/TheyAreAllOver';
import ToTheSky from '/imports/api/achievements/server/listeners/ToTheSky';
import TripleColon from '/imports/api/achievements/server/listeners/TripleColon';
import Undesirable from '/imports/api/achievements/server/listeners/Undesirable';
import Untouchable from '/imports/api/achievements/server/listeners/Untouchable';
import YouHaveGotBalls from '/imports/api/achievements/server/listeners/YouHaveGotBalls';
import {Games} from '/imports/api/games/games';
import {Players} from '/imports/api/games/players';

export default class GameListeners {
	/**
	 * @param gameId
	 */
	constructor(gameId) {
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

		players.forEach((player) => {
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
		});
	}

	stop() {
		this.listeners.forEach(function(achievement) {
			achievement.destroy();
		});

		this.listeners = [];
	}
}
