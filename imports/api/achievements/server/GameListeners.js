import AllBonusesInAGame from '/imports/api/achievements/server/listeners/AllBonusesInAGame.js';
import BattleOfTheGiants from '/imports/api/achievements/server/listeners/BattleOfTheGiants.js';
import BlankScreen from '/imports/api/achievements/server/listeners/BlankScreen.js';
import BonusesInAGame from '/imports/api/achievements/server/listeners/BonusesInAGame.js';
import BonusesInALifetime from '/imports/api/achievements/server/listeners/BonusesInALifetime.js';
import BonusesInAPoint from '/imports/api/achievements/server/listeners/BonusesInAPoint.js';
import CarefullyRandomlyPicked from '/imports/api/achievements/server/listeners/CarefullyRandomlyPicked.js';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed.js';
import ConsecutiveLostGames from '/imports/api/achievements/server/listeners/ConsecutiveLostGames.js';
import ConsecutiveWonGames from '/imports/api/achievements/server/listeners/ConsecutiveWonGames.js';
import DavidVsGoliath from '/imports/api/achievements/server/listeners/DavidVsGoliath.js';
import FullStop from '/imports/api/achievements/server/listeners/FullStop.js';
import GamesPlayed from '/imports/api/achievements/server/listeners/GamesPlayed.js';
import GamesWonUnderAMinute from '/imports/api/achievements/server/listeners/GamesWonUnderAMinute.js';
import GamesWonWithXShape from '/imports/api/achievements/server/listeners/GamesWonWithXShape.js';
import GameTime from '/imports/api/achievements/server/listeners/GameTime.js';
import HowToTieATie from '/imports/api/achievements/server/listeners/HowToTieATie.js';
import Intoxicated from '/imports/api/achievements/server/listeners/Intoxicated.js';
import InvincibleInALifetime from '/imports/api/achievements/server/listeners/InvincibleInALifetime.js';
import InvisibleInAGame from '/imports/api/achievements/server/listeners/InvisibleInAGame.js';
import InvisibleInALifetime from '/imports/api/achievements/server/listeners/InvisibleInALifetime.js';
import InvisibleInAPoint from '/imports/api/achievements/server/listeners/InvisibleInAPoint.js';
import IWasThereWaiting from '/imports/api/achievements/server/listeners/IWasThereWaiting.js';
import Ninja from '/imports/api/achievements/server/listeners/Ninja.js';
import PauseInAGame from '/imports/api/achievements/server/listeners/PauseInAGame.js';
import PauseInALifetime from '/imports/api/achievements/server/listeners/PauseInALifetime.js';
import PauseInAPoint from '/imports/api/achievements/server/listeners/PauseInAPoint.js';
import PointTime from '/imports/api/achievements/server/listeners/PointTime.js';
import Rakshasa from '/imports/api/achievements/server/listeners/Rakshasa.js';
import RandomInAGame from '/imports/api/achievements/server/listeners/RandomInAGame.js';
import Shutouts from '/imports/api/achievements/server/listeners/Shutouts.js';
import SimultaneousActivatedBonuses from '/imports/api/achievements/server/listeners/SimultaneousActivatedBonuses.js';
import Snoozer from '/imports/api/achievements/server/listeners/Snoozer.js';
import SuicidalTendencies from '/imports/api/achievements/server/listeners/SuicidalTendencies.js';
import TeenyTinyWorld from '/imports/api/achievements/server/listeners/TeenyTinyWorld.js';
import TheyAreAllOver from '/imports/api/achievements/server/listeners/TheyAreAllOver.js';
import ToTheSky from '/imports/api/achievements/server/listeners/ToTheSky.js';
import TripleColon from '/imports/api/achievements/server/listeners/TripleColon.js';
import Undesirable from '/imports/api/achievements/server/listeners/Undesirable.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

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
		});
	}

	stop() {
		this.listeners.forEach(function(achievement) {
			achievement.destroy();
		});

		this.listeners = [];
	}
}
