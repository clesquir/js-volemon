import StreamBundler from "./StreamBundler";
import {isObjectEmpty} from "../../../../lib/utils";
import Stream from "../../../../lib/stream/Stream";

export default class GameStreamBundler implements StreamBundler {
	stream: Stream;
	bundledStreamsToEmit: {[id: string]: any} = {};

	constructor(stream: Stream) {
		this.stream = stream;
		this.resetBundledStreams();
	}

	resetBundledStreams() {
		this.bundledStreamsToEmit = {};
	}

	addToBundledStreamsAtFrequence(
		lastCallTime: number,
		frequenceTime: number,
		streamName: string,
		data: any
	): number {
		if (Date.now() - lastCallTime >= frequenceTime) {
			this.addStreamToBundle(streamName, data);

			lastCallTime = Date.now();
		}

		return lastCallTime;
	}

	addStreamToBundle(streamName: string, data: any) {
		this.bundledStreamsToEmit[streamName] = data;
	}

	emitBundledStream(eventName: string, timestamp: number) {
		if (this.hasBundledStreamToSend()) {
			this.emitStream(eventName, this.bundledStreamsToEmit, timestamp);
		}
	}

	emitStream(eventName: string, payload: any, timestamp: number) {
		payload.timestamp = timestamp;
		this.stream.emit(eventName, payload);
	}

	private hasBundledStreamToSend(): boolean {
		return !isObjectEmpty(this.bundledStreamsToEmit);
	}
}
