import Stream from '/imports/lib/stream/Stream.js';

export default class ClientSocketIo extends Stream {

	connect() {
		// Socket io client
		const PORT = window.socketPort || 8080;
		let url = `http://localhost:${PORT}`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socket = require('socket.io-client').connect(url);
	}

	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	}

	on(eventName, callback) {
		this.socket.on(eventName, callback);
	}

	off(eventName) {
		this.socket.removeListener(eventName);
	}

}
