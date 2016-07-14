import StreamInitiator from '/client/lib/game/StreamInitiator.js';
import { isGameStatusOnGoing } from '/client/lib/game/utils.js';
import Game from '/client/lib/Game.js';
import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';
import { getUTCTimeStamp } from '/lib/utils.js';

export default class GameInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.streamInitiator = new StreamInitiator(this);
		this.currentGame = null;
		this.timerUpdater = null;
		this.serverOffset = TimeSync.serverOffset();
	}

	init() {
		var player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()}),
			game = Games.findOne(this.gameId);

		this.currentGame = null;

		//Player is in game and this game is already started
		if (player && isGameStatusOnGoing(game.status)) {
			this.createNewGame();
		}
		
		this.initTimer();

		this.streamInitiator.init();
	}

	stop() {
		if (this.hasActiveGame()) {
			this.currentGame.stop();
			this.currentGame = null;
		}

		this.streamInitiator.stop();

		this.clearTimer();
	}

	createNewGame() {
		this.currentGame = new Game(this.gameId);
		this.currentGame.start();
	}

	initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			this.updateTimer();
		}, 1000);
	}

	updateTimer() {
		var game = Games.findOne(this.gameId);

		if (game && game.status === Constants.GAME_STATUS_STARTED) {
			let matchTimer = getUTCTimeStamp() + this.serverOffset - game.startedAt;
			if (matchTimer < 0) {
				matchTimer = 0;
			}

			let pointTimer = getUTCTimeStamp() + this.serverOffset - game.lastPointAt;
			if (pointTimer < 0) {
				pointTimer = 0;
			}

			Session.set('matchTimer', moment(matchTimer).format('mm:ss'));
			Session.set('pointTimer', moment(pointTimer).format('mm:ss'));
		}
	}

	clearTimer() {
		Meteor.clearInterval(this.timerUpdater);
		Session.set('matchTimer', '00:00');
		Session.set('pointTimer', '00:00');
	}

	hasActiveGame() {
		return this.currentGame != null;
	}

}
