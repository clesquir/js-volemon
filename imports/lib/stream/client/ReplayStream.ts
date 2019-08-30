import Stream from "../Stream";

export default class ReplayStream implements Stream {
	private listeners: {[id: string]: Function[]} = {};

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
		if (this.listeners[eventName] !== undefined) {
			for (let listener of this.listeners[eventName]) {
				listener(payload);
			}
		}
	}

	broadcastOnEvent(eventName: string) {
	}

	on(eventName: string, callback: Function) {
		if (this.listeners[eventName] === undefined) {
			this.listeners[eventName] = [];
		}

		this.listeners[eventName].push(callback);
	}

	off(eventName: string) {
	}
}
