export const EventPublisher = {
	listeners: {},

	on: function(eventName, callback, scope) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}

		this.listeners[eventName].push({callback: callback, scope: scope});
	},

	off: function(eventName, listenerToRemove, scope) {
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
	},

	publish: function(event) {
		const eventName = event.constructor.name;

		if (!this.listeners[eventName]) {
			return;
		}

		this.listeners[eventName].forEach(function(listener) {
			listener.callback.call(listener.scope, event);
		});
	}
};
