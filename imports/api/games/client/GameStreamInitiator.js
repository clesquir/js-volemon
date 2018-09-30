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

		this.stream.on('killPlayer-' + gameId, (data) => {
			this.killPlayer(data.playerKey, data.killedAt);
		});

		this.stream.on('showBallHitPoint-' + gameId, (data) => {
			this.showBallHitPoint(data.x, data.y, data.diameter);
		});

		this.stream.on('showBallHitCount-' + gameId, (data) => {
			this.showBallHitCount(data.x, data.y, data.ballHitCount, data.fontSize, data.color);
		});

		this.stream.on('sendBundledData-' + gameId, (bundledData) => {
			const timestamp = bundledData.timestamp;

			if (bundledData.moveClientBall) {
				bundledData.moveClientBall.timestamp = timestamp;
				this.moveClientBall.call(this, bundledData.moveClientBall);
			}
			if (bundledData['moveClientPlayer-player1']) {
				bundledData['moveClientPlayer-player1'].timestamp = timestamp;
				this.moveClientPlayer.call(this, bundledData['moveClientPlayer-player1']);
			}
			if (bundledData['moveClientPlayer-player2']) {
				bundledData['moveClientPlayer-player2'].timestamp = timestamp;
				this.moveClientPlayer.call(this, bundledData['moveClientPlayer-player2']);
			}
			if (bundledData['moveClientPlayer-player3']) {
				bundledData['moveClientPlayer-player3'].timestamp = timestamp;
				this.moveClientPlayer.call(this, bundledData['moveClientPlayer-player3']);
			}
			if (bundledData['moveClientPlayer-player4']) {
				bundledData['moveClientPlayer-player4'].timestamp = timestamp;
				this.moveClientPlayer.call(this, bundledData['moveClientPlayer-player4']);
			}
			if (bundledData.createBonus) {
				this.createBonus.call(this, bundledData.createBonus);
			}
			if (bundledData.moveClientBonuses) {
				for (let clientBonus of bundledData.moveClientBonuses) {
					const bonusIdentifier = clientBonus[0];
					const bonusData = clientBonus[1];
					bonusData.timestamp = timestamp;
					this.moveClientBonus.call(this, bonusIdentifier, bonusData);
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

	moveClientPlayer(playerData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.moveClientPlayer(playerData);
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

	killPlayer(playerKey, killedAt) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.killPlayer(playerKey, killedAt);
		}
	}

	showBallHitPoint(x, y, diameter) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.showBallHitPoint(x, y, diameter);
		}
	}

	showBallHitCount(x, y, ballHitCount, fontSize, color) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.currentGame.showBallHitCount(x, y, ballHitCount, fontSize, color);
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
		this.stream.off('killPlayer-' + gameId);
		this.stream.off('sendBundledData-' + gameId);
		this.stream.off('showBallHitPoint-' + gameId);
		this.stream.off('showBallHitCount-' + gameId);
	}
}
