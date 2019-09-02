import Event from './events/Event';

declare type EventListener = {
	callback: Function,
	scope?: any
}

export default class EventPublisher {
	static listeners: {[id: string]: EventListener[]} = {};

	static on(eventName: string, callback: Function, scope: any) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}

		this.listeners[eventName].push({callback: callback, scope: scope});
	}

	static off(eventName: string, listenerToRemove: Function, scope: any) {
		if (!this.listeners[eventName]) {
			return;
		}

		const listeners = [];
		this.listeners[eventName].forEach(function(listener) {
			if (listener.callback !== listenerToRemove || listener.scope !== scope) {
				listeners.push(listener);
			}
		});

		if (listeners.length === 0) {
			delete this.listeners[eventName];
		} else {
			this.listeners[eventName] = listeners;
		}
	}

	static publish(event: Event) {
		const eventName = event.getClassName();

		if (!this.listeners[eventName]) {
			return;
		}

		this.listeners[eventName].forEach(function(listener) {
			listener.callback.call(listener.scope, event);
		});
	}
};
