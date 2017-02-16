import P2JSEngine from '/imports/game/engine/P2JSEngine.js';
import ServerGame from '/imports/game/server/ServerGame.js';
import { GameStream } from '/imports/lib/streams.js';

export default class ServerStreamInitiator {

	constructor(gameId) {
		this.gameId = gameId;
		this.currentGame = new ServerGame(this.gameId, new P2JSEngine());

		GameStream.on('sendBundledData-' + gameId, (bundledData) => {
			if (bundledData.moveOppositePlayer) {
				this.moveOppositePlayer.call(this, bundledData.moveOppositePlayer);
			}
		});
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

		GameStream.removeAllListeners('sendBundledData-' + this.gameId);
	}

}
