import {startKeepAlive} from '/server/keepAlive.js';

export default class StreamInitiator {

	constructor(gameId, stream) {
		this.gameId = gameId;
		this.stream = stream;
	}

	init() {
		this.stream.connect(this.gameId);
		this.stream.on('activateBonus-' + this.gameId, (bundledData) => {}, true);
		this.stream.on('sendBundledData-' + this.gameId, (bundledData) => {}, true);
	}

	start() {
		this.stream.emit('play-' + this.gameId, 'play');
		startKeepAlive(this.gameId, this.stream);
	}

	stop() {
		this.stream.off('sendBundledData-' + this.gameId);
		this.stream.off('activateBonus-' + this.gameId);
		this.stream.disconnect(this.gameId);
	}

}
