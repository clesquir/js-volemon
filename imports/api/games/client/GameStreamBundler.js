import { getUTCTimeStamp } from '/imports/lib/utils.js';

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
		if (getUTCTimeStamp() - lastCallTime >= frequenceTime) {
			this.addStreamToBundle(streamName, data);

			lastCallTime = getUTCTimeStamp();
		}

		return lastCallTime;
	}

	addStreamToBundle(streamName, data) {
		this.bundledStreamsToEmit[streamName] = data;
	}

	hasBundledStreamToSend() {
		return Object.keys(this.bundledStreamsToEmit).length > 0;
	}

	emitBundledStream(eventName) {
		if (this.hasBundledStreamToSend()) {
			this.emitStream(eventName, this.bundledStreamsToEmit);
		}
	}

	emitStream(eventName, payload) {
		this.stream.emit(eventName, payload);
	}

}
