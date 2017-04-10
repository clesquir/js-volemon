export default class StreamManager {

	/**
	 * @param {Stream} stream
	 */
	constructor(stream) {
		this.stream = stream;
	}

	init() {
		this.stream.init();
	}

	/**
	 * @param {String} gameId
	 */
	connect(gameId) {
		this.stream.connect(gameId);
	}

	/**
	 * @param {String} gameId
	 */
	disconnect(gameId) {
		this.stream.disconnect(gameId);
	}

}
