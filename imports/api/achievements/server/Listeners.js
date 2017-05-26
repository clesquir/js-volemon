import AllBonusesInAGame from '/imports/api/achievements/server/listeners/AllBonusesInAGame.js';
import BonusesInAGame from '/imports/api/achievements/server/listeners/BonusesInAGame.js';
import BonusesInALifetime from '/imports/api/achievements/server/listeners/BonusesInALifetime.js';
import BonusesInAPoint from '/imports/api/achievements/server/listeners/BonusesInAPoint.js';
import ConsecutiveDaysPlayed from '/imports/api/achievements/server/listeners/ConsecutiveDaysPlayed.js';
import ConsecutiveLostGames from '/imports/api/achievements/server/listeners/ConsecutiveLostGames.js';
import ConsecutiveWonGames from '/imports/api/achievements/server/listeners/ConsecutiveWonGames.js';
import GamesPlayed from '/imports/api/achievements/server/listeners/GamesPlayed.js';
import GameTime from '/imports/api/achievements/server/listeners/GameTime.js';
import GamesWonWithXShape from '/imports/api/achievements/server/listeners/GamesWonWithXShape.js';
import InvincibleInALifetime from '/imports/api/achievements/server/listeners/InvincibleInALifetime.js';
import InvisibleInAGame from '/imports/api/achievements/server/listeners/InvisibleInAGame.js';
import InvisibleInALifetime from '/imports/api/achievements/server/listeners/InvisibleInALifetime.js';
import InvisibleInAPoint from '/imports/api/achievements/server/listeners/InvisibleInAPoint.js';
import PauseInAGame from '/imports/api/achievements/server/listeners/PauseInAGame.js';
import PauseInALifetime from '/imports/api/achievements/server/listeners/PauseInALifetime.js';
import PauseInAPoint from '/imports/api/achievements/server/listeners/PauseInAPoint.js';
import PointTime from '/imports/api/achievements/server/listeners/PointTime.js';
import Shutouts from '/imports/api/achievements/server/listeners/Shutouts.js';
import SimultaneousActivatedBonuses from '/imports/api/achievements/server/listeners/SimultaneousActivatedBonuses.js';
import {Games} from '/imports/api/games/games.js';
import {Players} from '/imports/api/games/players.js';

export default class Listeners {
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

		if (!game || game.isPracticeGame) {
			return;
		}

		const players = Players.find({gameId: this.gameId});

		players.forEach((player) => {
			this.listeners.push(new PointTime(this.gameId, player.userId));
			this.listeners.push(new GameTime(this.gameId, player.userId));
			this.listeners.push(new GamesPlayed(this.gameId, player.userId));
			this.listeners.push(new Shutouts(this.gameId, player.userId));
			this.listeners.push(new ConsecutiveWonGames(this.gameId, player.userId));
			this.listeners.push(new ConsecutiveDaysPlayed(this.gameId, player.userId));
			this.listeners.push(new PauseInAPoint(this.gameId, player.userId));
			this.listeners.push(new PauseInAGame(this.gameId, player.userId));
			this.listeners.push(new PauseInALifetime(this.gameId, player.userId));
			this.listeners.push(new InvisibleInAPoint(this.gameId, player.userId));
			this.listeners.push(new InvisibleInAGame(this.gameId, player.userId));
			this.listeners.push(new InvisibleInALifetime(this.gameId, player.userId));
			this.listeners.push(new BonusesInAPoint(this.gameId, player.userId));
			this.listeners.push(new BonusesInAGame(this.gameId, player.userId));
			this.listeners.push(new BonusesInALifetime(this.gameId, player.userId));
			this.listeners.push(new SimultaneousActivatedBonuses(this.gameId, player.userId));
			this.listeners.push(new AllBonusesInAGame(this.gameId, player.userId));
			this.listeners.push(new GamesWonWithXShape(this.gameId, player.userId));
			this.listeners.push(new InvincibleInALifetime(this.gameId, player.userId));
			this.listeners.push(new ConsecutiveLostGames(this.gameId, player.userId));
		});
	}

	stop() {
		this.listeners.forEach(function(achievement) {
			achievement.destroy();
		});

		this.listeners = [];
	}
}
