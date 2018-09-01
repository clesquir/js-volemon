import StreamBundler from '/imports/api/games/client/streamBundler/StreamBundler.js';
import {isObjectEmpty} from '/imports/lib/utils.js';

export default class GameStreamBundler extends StreamBundler {
	/**
	 * @param {Stream} stream
	 */
	constructor(stream) {
		super();
		this.stream = stream;
		this.resetBundledStreams();
	}

	/**
	 * @public
	 */
	resetBundledStreams() {
		this.bundledStreamsToEmit = {};
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
		if (Date.now() - lastCallTime >= frequenceTime) {
			this.addStreamToBundle(streamName, data);

			lastCallTime = Date.now();
		}

		return lastCallTime;
	}

	/**
	 * @public
	 * @param streamName
	 * @param data
	 */
	addStreamToBundle(streamName, data) {
		this.bundledStreamsToEmit[streamName] = data;
	}

	/**
	 * @public
	 * @param eventName
	 * @param timestamp
	 */
	emitBundledStream(eventName, timestamp) {
		if (this.hasBundledStreamToSend()) {
			this.emitStream(eventName, this.bundledStreamsToEmit, timestamp);
		}
	}

	/**
	 * @public
	 * @param eventName
	 * @param payload
	 * @param timestamp
	 */
	emitStream(eventName, payload, timestamp) {
		payload.timestamp = timestamp;
		this.stream.emit(eventName, payload);
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	hasBundledStreamToSend() {
		return !isObjectEmpty(this.bundledStreamsToEmit);
	}
}
