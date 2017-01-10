import { Games } from '/collections/games.js';
import { Constants } from '/lib/constants.js';
import { GameStream } from '/lib/streams.js';

export default class StreamInitiator {

	constructor(gameInitiator = null) {
		/** @type {GameInitiator} */
		this.gameInitiator = gameInitiator;
		this.gamePointsTracker = null;
	}

	init() {
		let gameInitiator = this.gameInitiator;
		let gameId = gameInitiator.gameId;

		GameStream.on('play-' + gameId, function() {
			let loopUntilGameContainerIsCreated;

			//Wait for gameContainer creation before starting game
			loopUntilGameContainerIsCreated = function() {
				if (document.getElementById('gameContainer')) {
					gameInitiator.createNewGame();
				} else {
					window.setTimeout(loopUntilGameContainerIsCreated, 1);
				}
			};

			loopUntilGameContainerIsCreated();
		});

		this.gamePointsTracker = Games.find({_id: gameId}).observeChanges({
			changed: (id, fields) => {
				if (
					fields.hasOwnProperty(Constants.HOST_POINTS_COLUMN) ||
					fields.hasOwnProperty(Constants.CLIENT_POINTS_COLUMN)
				) {
					if (gameInitiator.hasActiveGame()) {
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
		let gameInitiator = this.gameInitiator;

		if (!gameInitiator.userIsGameCreator() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBall(ballData);
		}
	}

	moveOppositePlayer(isUserHost, playerData) {
		let gameInitiator = this.gameInitiator;

		//Sent data is for opposite player
		if (
			((isUserHost && !gameInitiator.userIsGameCreator()) || (!isUserHost && gameInitiator.userIsGameCreator())) &&
			gameInitiator.hasActiveGame()
		) {
			gameInitiator.currentGame.moveOppositePlayer(playerData);
		}
	}

	createBonus(bonusData) {
		let gameInitiator = this.gameInitiator;

		if (!gameInitiator.userIsGameCreator() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.createBonus(bonusData);
		}
	}

	activateBonus(bonusIdentifier, playerKey) {
		let gameInitiator = this.gameInitiator;

		if (!gameInitiator.userIsGameCreator() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.activateBonus(bonusIdentifier, playerKey);
		}
	}

	moveClientBonus(bonusIdentifier, bonusData) {
		let gameInitiator = this.gameInitiator;

		if (!gameInitiator.userIsGameCreator() && gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBonus(bonusIdentifier, bonusData);
		}
	}

	stop() {
		let gameId = this.gameInitiator.gameId;

		GameStream.removeAllListeners('play-' + gameId);
		GameStream.removeAllListeners('activateBonus-' + gameId);
		GameStream.removeAllListeners('sendBundledData-' + gameId);

		if (this.gamePointsTracker) {
			this.gamePointsTracker.stop();
		}
	}

}
