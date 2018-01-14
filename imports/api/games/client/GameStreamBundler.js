import {isObjectEmpty} from '/imports/lib/utils.js';

export default class GameStreamBundler {

	/**
	 * @param {Stream} stream
	 */
	constructor(stream) {
		this.stream = stream;
		this.resetBundledStreams();
	}

	resetBundledStreams() {
		this.bundledStreamsToEmit = {};
	}

	addToBundledStreamsAtFrequence(lastCallTime, frequenceTime, streamName, data) {
		if (Date.now() - lastCallTime >= frequenceTime) {
			this.addStreamToBundle(streamName, data);

			lastCallTime = Date.now();
		}

		return lastCallTime;
	}

	addStreamToBundle(streamName, data) {
		this.bundledStreamsToEmit[streamName] = data;
	}

	hasBundledStreamToSend() {
		return !isObjectEmpty(this.bundledStreamsToEmit);
	}

	emitBundledStream(eventName, timestamp) {
		if (this.hasBundledStreamToSend()) {
			this.emitStream(eventName, this.bundledStreamsToEmit, timestamp);
		}
	}

	emitStream(eventName, payload, timestamp) {
		payload.timestamp = timestamp;
		this.stream.emit(eventName, payload);
	}

}
