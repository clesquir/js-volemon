import {startKeepAlive} from '/imports/api/games/server/keepAlive.js';
import PlayerKilled from '/imports/api/games/events/PlayerKilled';
import EventPublisher from '/imports/lib/EventPublisher.js';

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
		this.stream.broadcastOnEvent('showBallHitCount-' + this.gameId);
		this.stream.broadcastOnEvent('activateBonus-' + this.gameId);
		this.stream.broadcastOnEvent('killPlayer-' + this.gameId);
		this.stream.broadcastOnEvent('sendBundledData-' + this.gameId);
		this.stream.broadcastOnEvent('reaction-' + this.gameId);
		this.stream.broadcastOnEvent('cheer-' + this.gameId);
		this.stream.on('killPlayer-' + this.gameId, (data) => {
			EventPublisher.publish(new PlayerKilled(this.gameId, data.playerKey, data.killedAt));
		});
	}

	start() {
		this.stream.emit('play-' + this.gameId, 'play');
		startKeepAlive(this.gameId, this.stream);
	}

	destroy() {
		this.stream.off('cheer-' + this.gameId);
		this.stream.off('reaction-' + this.gameId);
		this.stream.off('sendBundledData-' + this.gameId);
		this.stream.off('activateBonus-' + this.gameId);
		this.stream.off('killPlayer-' + this.gameId);
		this.stream.off('showBallHitCount-' + this.gameId);
		this.stream.off('showBallHitPoint-' + this.gameId);
		this.stream.disconnect(this.gameId);
	}
}
