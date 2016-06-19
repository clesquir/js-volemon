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
				Session.set('matchTimer', moment(getUTCTimeStamp() - game.startedAt).format('mm:ss'));
				Session.set('pointTimer', moment(getUTCTimeStamp() - game.lastPointAt).format('mm:ss'));
			}
		}, 1000);
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
