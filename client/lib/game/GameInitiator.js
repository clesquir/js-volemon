import Game from '/client/lib/Game.js';
import StreamInitiator from '/client/lib/game/StreamInitiator.js';

export default class GameInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.streamInitiator = new StreamInitiator(this);
		this.currentGame = null;
	}

	init() {
		var player = Players.findOne({gameId: this.gameId, userId: Meteor.userId()}),
			game = Games.findOne(this.gameId);

		this.currentGame = null;

		//Player is in game and this game is already started
		if (player && isGameStatusOnGoing(game.status)) {
			this.createNewGame();
		}

		this.streamInitiator.init();
	}

	stop() {
		if (this.hasActiveGame()) {
			this.currentGame.stop();
			this.currentGame = null;
		}

		this.streamInitiator.stop();
	}

	createNewGame() {
		this.currentGame = new Game();
		this.currentGame.start();
	}

	hasActiveGame() {
		return this.currentGame != null;
	}

}
