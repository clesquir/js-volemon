import { Games } from '/collections/games.js';
import { Players } from '/collections/players.js';
import { Constants } from '/lib/constants.js';
import { GameStream } from '/lib/streams.js';

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
						gameInitiator.updateTimer();
						gameInitiator.currentGame.shakeLevel();
						gameInitiator.currentGame.resumeOnTimerEnd();
					}
				}
			}
		});

		GameStream.on('activateBonus-' + gameId, (bonusIdentifier, playerKey) => {
			this.activateBonus(bonusIdentifier, playerKey);
		});

		GameStream.on('sendBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveClientBall) {
				this.moveClientBall.apply(this, bundledData.moveClientBall);
			}
			if (bundledData.moveOppositePlayer) {
				this.moveOppositePlayer.apply(this, bundledData.moveOppositePlayer);
			}
			if (bundledData.createBonus) {
				this.createBonus.apply(this, bundledData.createBonus);
			}
			if (bundledData.moveClientBonuses) {
				for (let clientBonus of bundledData.moveClientBonuses) {
					this.moveClientBonus.apply(this, clientBonus);
				}
			}
		});
	}

	moveClientBall(ballData) {
		var gameInitiator = this.gameInitiator;
		var gameId = gameInitiator.gameId;
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

		//Player is in game and is not the creator
		if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBall(ballData);
		}
	}

	moveOppositePlayer(isUserHost, playerData) {
		var gameInitiator = this.gameInitiator;
		var gameId = gameInitiator.gameId;
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

		//Player is in game and sent data is for opposite player
		if (
			game && player &&
			((isUserHost && game.createdBy !== Meteor.userId()) || (!isUserHost && game.createdBy === Meteor.userId())) &&
			gameInitiator.hasActiveGame()
		) {
			gameInitiator.currentGame.moveOppositePlayer(playerData);
		}
	}

	createBonus(bonusData) {
		var gameInitiator = this.gameInitiator;
		var gameId = gameInitiator.gameId;
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

		//Player is in game and is not the creator
		if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.createBonus(bonusData);
		}
	}

	activateBonus(bonusIdentifier, playerKey) {
		var gameInitiator = this.gameInitiator;
		var gameId = gameInitiator.gameId;
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

		//Player is in game and is not the creator
		if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.activateBonus(bonusIdentifier, playerKey);
		}
	}

	moveClientBonus(bonusIdentifier, bonusData) {
		var gameInitiator = this.gameInitiator;
		var gameId = gameInitiator.gameId;
		var game = Games.findOne(gameId);
		var player = Players.findOne({gameId: gameId, userId: Meteor.userId()});

		//Player is in game and is not the creator
		if (game && player && game.createdBy !== Meteor.userId() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBonus(bonusIdentifier, bonusData);
		}
	}

	stop() {
		var gameId = this.gameInitiator.gameId;

		GameStream.removeAllListeners('play-' + gameId);
		GameStream.removeAllListeners('activateBonus-' + gameId);
		GameStream.removeAllListeners('sendBundledData-' + gameId);

		if (this.gamePointsTracker) {
			this.gamePointsTracker.stop();
		}
	}

}
