export default class ClientStreamInitiator {

	constructor(gameInitiator = null) {
		/** @type {ClientGameInitiator} */
		this.gameInitiator = gameInitiator;
	}

	init() {
		let gameInitiator = this.gameInitiator;
		let gameId = gameInitiator.gameId;

		ClientStream.on('play-' + gameId, function() {
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

		ClientStream.on('activateBonus-' + gameId, (data) => {
			this.activateBonus(data.identifier, data.player);
		});

		ClientStream.on('sendServerBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveClientBall) {
				this.moveClientBall.call(this, bundledData.moveClientBall);
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

		ClientStream.on('sendClientBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveOppositePlayer) {
				this.moveOppositePlayer.call(this, bundledData.moveOppositePlayer);
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

	activateBonus(bonusIdentifier, playerKey) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.activateBonus(bonusIdentifier, playerKey);
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

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.stop();
		}

		ClientStream.off('play-' + gameId);
		ClientStream.off('activateBonus-' + gameId);
		ClientStream.off('sendServerBundledData-' + gameId);
		ClientStream.off('sendClientBundledData-' + gameId);
	}

}
