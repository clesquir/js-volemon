import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';

export default class StreamInitiator {

	constructor(gameInitiator = null) {
		/** @type {GameInitiator} */
		this.gameInitiator = gameInitiator;
		this.gamePointsTracker = null;
	}

	init() {
		var gameInitiator = this.gameInitiator,
			gameId = gameInitiator.gameId;

		GameStream.on('play-' + gameId, function() {
			var player = Players.findOne({gameId: gameId, userId: Meteor.userId()}),
				loopUntilGameContainerIsCreated;

			//Player is in game and this is the current game being started
			if (player) {
				//Wait for gameContainer creation before starting game
				loopUntilGameContainerIsCreated = function() {
					if (document.getElementById('gameContainer')) {
						gameInitiator.createNewGame();
					} else {
						window.setTimeout(loopUntilGameContainerIsCreated, 1);
					}
				};

				loopUntilGameContainerIsCreated();
			}
		});

		this.gamePointsTracker = Games.find({_id: gameId}).observeChanges({
			changed: (id, fields) => {
				if (
					fields.hasOwnProperty(Constants.HOST_POINTS_COLUMN) ||
					fields.hasOwnProperty(Constants.CLIENT_POINTS_COLUMN)
				) {
					let game = Games.findOne(gameId);
					let player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

					//Player is in game
					if (game && player && gameInitiator.hasActiveGame()) {
						gameInitiator.currentGame.shakeLevel();
						gameInitiator.currentGame.resumeOnTimerEnd();
					}
				}
			}
		});

		GameStream.on('moveClientBall-' + gameId, function(ballData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.moveClientBall(ballData);
			}
		});

		GameStream.on('moveOppositePlayer-' + gameId, function(isUserHost, playerData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and sent data is for opposite player
			if (
				game && player &&
				((isUserHost && game.createdBy !== Meteor.userId()) || (!isUserHost && game.createdBy === Meteor.userId())) &&
				gameInitiator.hasActiveGame()
			) {
				gameInitiator.currentGame.moveOppositePlayer(playerData);
			}
		});

		GameStream.on('createBonus-' + gameId, function(bonusData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.createBonus(bonusData);
			}
		});

		GameStream.on('activateBonus-' + gameId, function(playerKey) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.activateBonus(playerKey);
			}
		});

		GameStream.on('moveClientBonus-' + gameId, function(bonusData) {
			var game = Games.findOne(gameId),
				player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

			//Player is in game and is not the creator
			if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
				gameInitiator.currentGame.moveClientBonus(bonusData);
			}
		});
	}

	stop() {
		var gameId = this.gameInitiator.gameId;

		GameStream.removeAllListeners('play-' + gameId);
		GameStream.removeAllListeners('moveClientBall-' + gameId);
		GameStream.removeAllListeners('moveOppositePlayer-' + gameId);
		GameStream.removeAllListeners('createBonus-' + gameId);
		GameStream.removeAllListeners('activateBonus-' + gameId);
		GameStream.removeAllListeners('moveClientBonus-' + gameId);

		if (this.gamePointsTracker) {
			this.gamePointsTracker.stop();
		}
	}

}
