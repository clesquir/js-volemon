export default class ServerStreamInitiator {

	constructor(gameId) {
		this.gameId = gameId;

		ServerStream.on('activateBonus-' + gameId, (bundledData) => {}, true);
		ServerStream.on('sendBundledData-' + gameId, (bundledData) => {}, true);
	}

	start() {
		startKeepAlive(this.gameId);
	}

	stop() {
		ServerStream.off('sendBundledData-' + this.gameId);
	}

}
