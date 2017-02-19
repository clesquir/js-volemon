import Stream from '/imports/lib/stream/Stream.js';

export default class ClientSocketIo extends Stream {

	connect() {
		// Socket io client
		const PORT = window.socketPort || 8080;
		const url = `http://localhost:${PORT}`;

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
