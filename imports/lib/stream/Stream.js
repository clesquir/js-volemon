export default class Stream {

	init() {
	}

	/**
	 * @param {string} channel
	 */
	connect(channel) {
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
	}

	/**
	 * @param {string} eventName
	 */
	broadcastOnEvent(eventName) {
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
	}

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
	}

}
