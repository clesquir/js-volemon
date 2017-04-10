import Stream from '/imports/lib/stream/Stream.js';

export default class StreamInitiator {

	/**
	 * @param {GameInitiator} gameInitiator
	 * @param {Stream} stream
	 */
	constructor(gameInitiator, stream) {
		this.gameInitiator = gameInitiator;
		this.stream = stream;
	}

	init() {
		let gameInitiator = this.gameInitiator;
		let gameId = gameInitiator.gameId;

		this.stream.on('play-' + gameId, function() {
			//Wait for gameContainer creation before starting game
			let loopUntilGameContainerIsCreated = function() {
				if (document.getElementById('gameContainer')) {
					gameInitiator.createNewGame();
				} else {
					window.setTimeout(loopUntilGameContainerIsCreated, 1);
				}
			};

			loopUntilGameContainerIsCreated();
		});

		this.stream.on('activateBonus-' + gameId, (data) => {
			this.activateBonus(data.identifier, data.player, data.activatedAt);
		});

		this.stream.on('sendBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveClientBall) {
				this.moveClientBall.call(this, bundledData.moveClientBall);
			}
			if (bundledData.moveOppositePlayer) {
				this.moveOppositePlayer.call(this, bundledData.moveOppositePlayer);
			}
			if (bundledData.createBonus) {
				this.createBonus.call(this, bundledData.createBonus);
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

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBall(ballData);
		}
	}

	moveOppositePlayer(playerData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveOppositePlayer(playerData);
		}
	}

	createBonus(bonusData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.createBonus(bonusData);
		}
	}

	activateBonus(bonusIdentifier, playerKey, activatedAt) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.activateBonus(bonusIdentifier, playerKey, activatedAt);
		}
	}

	moveClientBonus(bonusIdentifier, bonusData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientBonus(bonusIdentifier, bonusData);
		}
	}

	stop() {
		let gameInitiator = this.gameInitiator;
		let gameId = gameInitiator.gameId;

		this.stream.off('play-' + gameId);
		this.stream.off('activateBonus-' + gameId);
		this.stream.off('sendBundledData-' + gameId);
	}

}
