export default interface Stream {
	init();

	connect(channel: string);

	disconnect(channel: string);

	connectedToP2P(): boolean;

	supportsP2P(): boolean;

	emit(eventName: string, payload);

	broadcastOnEvent(eventName: string);

	on(eventName: string, callback: Function);

	off(eventName: string);
}
