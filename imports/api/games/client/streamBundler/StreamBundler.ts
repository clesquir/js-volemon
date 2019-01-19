export default interface StreamBundler {
	resetBundledStreams();

	addToBundledStreamsAtFrequence(
		lastCallTime: number,
		frequenceTime: number,
		streamName: string,
		data: any
	): number;

	addStreamToBundle(streamName: string, data: any);

	emitBundledStream(eventName: string, timestamp: number);

	emitStream(eventName: string, payload: any, timestamp: number);
}
