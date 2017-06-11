export default class GameStreamInitiator {

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
			gameInitiator.createNewGameWhenReady();
		});

		this.stream.on('activateBonus-' + gameId, (data) => {
			this.activateBonus(
				data.identifier,
				data.player,
				data.activatedAt,
				data.x,
				data.y,
				data.beforeActivationData
			);
		});

		this.stream.on('showBallHitPoint-' + gameId, (data) => {
			this.showBallHitPoint(data.x, data.y, data.diameter);
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

	activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData);
		}
	}

	showBallHitPoint(x, y, diameter) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.showBallHitPoint(x, y, diameter);
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
		this.stream.off('showBallHitPoint-' + gameId);
	}

}
