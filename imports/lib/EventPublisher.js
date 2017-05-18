export const EventPublisher = {
	listeners: {},

	on: function(eventName, listener, scope) {
		if (!this.listeners[eventName]) {
			this.listeners[eventName] = [];
		}

		this.listeners[eventName].push({listener: listener, scope: scope});
	},

	off: function(eventName, listenerToRemove, scope) {
		if (!this.listeners[eventName]) {
			return;
		}

		const listeners = [];
		this.listeners[eventName].forEach(function(listener) {
			if (listener.listner === listenerToRemove && listener.scope === scope) {
				listeners.push(listener);
			}
		});

		this.listeners[eventName] = listeners;
	},

	publish: function(event) {
		const eventName = event.constructor.name;

		if (!this.listeners[eventName]) {
			return;
		}

		this.listeners[eventName].forEach(function(listener) {
			listener.listener.call(listener.scope, event);
		});
	}
};
