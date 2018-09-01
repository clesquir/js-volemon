import StreamBundler from '/imports/api/games/client/streamBundler/StreamBundler.js';

export default class NullStreamBundler extends StreamBundler {
	/**
	 * @public
	 */
	resetBundledStreams() {
	}

	/**
	 * @public
	 * @param lastCallTime
	 * @param frequenceTime
	 * @param streamName
	 * @param data
	 * @returns {*}
	 */
	addToBundledStreamsAtFrequence(lastCallTime, frequenceTime, streamName, data) {
		return lastCallTime;
	}

	/**
	 * @public
	 * @param streamName
	 * @param data
	 */
	addStreamToBundle(streamName, data) {
	}

	/**
	 * @public
	 * @param eventName
	 * @param timestamp
	 */
	emitBundledStream(eventName, timestamp) {
	}

	/**
	 * @public
	 * @param eventName
	 * @param payload
	 * @param timestamp
	 */
	emitStream(eventName, payload, timestamp) {
	}
}
