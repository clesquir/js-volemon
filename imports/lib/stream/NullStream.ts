import Stream from "./Stream";

export default class NullStream implements Stream {
	init() {
	}

	connect(channel: string) {
	}

	disconnect(channel: string) {
	}

	connectedToP2P(): boolean {
		return false;
	}

	supportsP2P(): boolean {
		return false;
	}

	emit(eventName: string, payload) {
	}

	broadcastOnEvent(eventName: string) {
	}

	on(eventName: string, callback: Function) {
	}

	off(eventName: string) {
	}
}
