import P2JSEngine from '/imports/game/engine/P2JSEngine.js';
import ServerGame from '/imports/game/server/ServerGame.js';

export default class ServerStreamInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.currentGame = new ServerGame(this.gameId, new P2JSEngine());

		ServerStream.on('sendClientBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveOppositePlayer) {
				this.moveOppositePlayer.call(this, bundledData.moveOppositePlayer);
			}
		}, true);
	}

	start() {
		this.currentGame.start();
	}

	onAddGamePoint() {
		this.currentGame.resumeOnTimerEnd();
	}

	moveOppositePlayer(playerData) {
		this.currentGame.moveOppositePlayer(playerData);
	}

	stop() {
		if (this.currentGame) {
			this.currentGame.stop();
		}

		ServerStream.off('sendBundledData-' + this.gameId);
	}

}
