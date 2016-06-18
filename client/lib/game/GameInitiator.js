import Game from '/client/lib/Game.js';
import StreamInitiator from '/client/lib/game/StreamInitiator.js';

export default class GameInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.streamInitiator = new StreamInitiator(this);
		this.currentGame = null;
		this.timerUpdater = null;
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
		this.currentGame = new Game();
		this.currentGame.start();
	}

	initTimer() {
		this.timerUpdater = Meteor.setInterval(() => {
			var game = Games.findOne(this.gameId);

			if (game && game.status === Constants.GAME_STATUS_STARTED) {
				Session.set('matchTimer', getTimerFormatted(getUTCTimeStamp() - game.startedAt));
				Session.set('pointTimer', getTimerFormatted(getUTCTimeStamp() - game.lastPointAt));
			}
		}, 1000);
	}

	clearTimer() {
		Meteor.clearInterval(this.timerUpdater);
		Session.set('matchTimer', getTimerFormatted(0));
		Session.set('pointTimer', getTimerFormatted(0));
	}

	hasActiveGame() {
		return this.currentGame != null;
	}

}
