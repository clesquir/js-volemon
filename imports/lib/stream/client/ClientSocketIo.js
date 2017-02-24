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
		this.p2p = new (require('socket.io-p2p'))(this.socket);
		this.p2p.on('ready', () => {
			this.p2p.usePeerConnection = true;
		})
	}

	emit(eventName, payload) {
		this.p2p.emit(eventName, payload);
	}

	on(eventName, callback) {
		this.p2p.on(eventName, callback);
	}

	off(eventName) {
		this.p2p.removeListener(eventName);
	}

}
