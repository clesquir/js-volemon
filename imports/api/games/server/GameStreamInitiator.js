import {startKeepAlive} from '/imports/api/games/server/keepAlive.js';

export default class GameStreamInitiator {

	/**
	 * @param {string} gameId
	 * @param {Stream} stream
	 */
	constructor(gameId, stream) {
		this.gameId = gameId;
		this.stream = stream;
	}

	init() {
		this.stream.connect(this.gameId);
		this.stream.broadcastOnEvent('showBallHitPoint-' + this.gameId);
		this.stream.broadcastOnEvent('activateBonus-' + this.gameId);
		this.stream.broadcastOnEvent('killPlayer-' + this.gameId);
		this.stream.broadcastOnEvent('sendBundledData-' + this.gameId);
		this.stream.broadcastOnEvent('reaction-' + this.gameId);
		this.stream.broadcastOnEvent('cheer-' + this.gameId);
	}

	start() {
		this.stream.emit('play-' + this.gameId, 'play');
		startKeepAlive(this.gameId, this.stream);
	}

	stop() {
		this.stream.off('cheer-' + this.gameId);
		this.stream.off('reaction-' + this.gameId);
		this.stream.off('sendBundledData-' + this.gameId);
		this.stream.off('activateBonus-' + this.gameId);
		this.stream.off('killPlayer-' + this.gameId);
		this.stream.off('showBallHitPoint-' + this.gameId);
		this.stream.disconnect(this.gameId);
	}

}
