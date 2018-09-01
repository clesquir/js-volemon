import {isObjectEmpty} from '/imports/lib/utils.js';

export default class StreamBundler {
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
