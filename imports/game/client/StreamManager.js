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
	 * @param {string} gameId
	 */
	connect(gameId) {
		this.stream.connect(gameId);
	}

	/**
	 * @param {string} gameId
	 */
	disconnect(gameId) {
		this.stream.disconnect(gameId);
	}

}
