import StreamBundler from "./StreamBundler";

export default class NullStreamBundler implements StreamBundler {
	resetBundledStreams() {
	}

	addToBundledStreamsAtFrequence(
		lastCallTime: number,
		frequenceTime: number,
		streamName: string,
		data: any
	): number {
		return lastCallTime;
	}

	addStreamToBundle(streamName: string, data: any) {
	}

	emitBundledStream(eventName: string, timestamp: number) {
	}

	emitStream(eventName: string, payload: any, timestamp: number) {
	}
}
