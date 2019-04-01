import Stream from "../../../lib/stream/Stream";
import ClientGameInitiator from "./ClientGameInitiator";
import {BonusPositionData} from "../bonus/data/BonusPositionData";

export default class GameStreamInitiator {
	gameInitiator: ClientGameInitiator;
	stream: Stream;

	constructor(
		gameInitiator: ClientGameInitiator,
		stream: Stream
	) {
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
			this.showBallHitCount(data.x, data.y, data.ballHitCount, data.color);
		});

		this.stream.on('sendBundledData-' + gameId, (bundledData) => {
			const timestamp = bundledData.timestamp;

			if (bundledData.moveClientBall) {
				bundledData.moveClientBall.timestamp = timestamp;
				this.moveClientBall.call(this, bundledData.moveClientBall);
			}

			for (let key in bundledData) {
				if (bundledData.hasOwnProperty(key) && key.indexOf('moveClientPlayer-') === 0) {
					bundledData[key].timestamp = timestamp;
					this.moveClientPlayer.call(this, bundledData[key]);
				}
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

	private moveClientBall(ballData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.moveClientBall(ballData);
		}
	}

	private moveClientPlayer(playerData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.moveClientPlayer(playerData);
		}
	}

	private createBonus(bonusData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.createBonus(bonusData);
		}
	}

	private activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.activateBonus(bonusIdentifier, playerKey, activatedAt, x, y, beforeActivationData);
		}
	}

	private killPlayer(playerKey, killedAt) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.killClientPlayer(playerKey, killedAt);
		}
	}

	private showBallHitPoint(x, y, diameter) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.showBallHitPoint(x, y, diameter);
		}
	}

	private showBallHitCount(x: number, y: number, ballHitCount: number, color: string) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.showBallHitCount(x, y, ballHitCount, color);
		}
	}

	private moveClientBonus(bonusIdentifier: string, bonusData: BonusPositionData) {
		let gameInitiator = this.gameInitiator;

		if (gameInitiator.hasActiveGame()) {
			gameInitiator.mainScene.moveClientBonus(bonusIdentifier, bonusData);
		}
	}
}
