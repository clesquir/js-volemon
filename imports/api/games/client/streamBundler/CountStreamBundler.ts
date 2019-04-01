import StreamBundler from "./StreamBundler";

export default class CountStreamBundler implements StreamBundler {
	addedCount: number = 0;
	emittedCount: number = 0;

	resetBundledStreams() {
		this.addedCount = 0;
		this.emittedCount = 0;
	}

	addToBundledStreamsAtFrequence(
		lastCallTime: number,
		frequenceTime: number,
		streamName: string,
		data: any
	): number {
		this.addedCount++;
		return lastCallTime;
	}

	addStreamToBundle(streamName: string, data: any) {
		this.addedCount++;
	}

	emitBundledStream(eventName: string, timestamp: number) {
		this.emittedCount++;
	}

	emitStream(eventName: string, payload: any, timestamp: number) {
		this.emittedCount++;
	}
}
