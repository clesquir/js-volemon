import Stream from '/imports/lib/stream/Stream.js';

let isWebRTCSupported = !!require('get-browser-rtc')();

export default class ClientSocketIo extends Stream {

	connect() {
		// Socket io client
		const PORT = window.socketPort || 8080;
		let url = `http://localhost:${PORT}`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socket = require('socket.io-client').connect(url);
		this.socketAdapter = this.socket;

		if (isWebRTCSupported) {
			this.p2p = new (require('socket.io-p2p'))(this.socket, {numClients: 10, autoUpgrade: true});
			this.p2p.on('ready', () => {
				this.p2p.usePeerConnection = true;
			});
			this.p2pAdapter = this.p2p;
		}
	}

	/**
	 * @param {string} eventName
	 * @param payload
	 */
	emit(eventName, payload) {
		if (this.p2pAdapter) {
			if (!this.p2pAdapter.usePeerConnection) {
				payload.webRTCUnsupportedClient = true;
			}
			this.p2pAdapter.emit(eventName, payload);
		} else {
			payload.webRTCUnsupportedClient = true;
			this.socketAdapter.emit(eventName, payload);
		}
	}

	/**
	 * @param {string} eventName
	 * @param callback
	 */
	on(eventName, callback) {
		let adapter;
		if (this.p2pAdapter) {
			adapter = this.p2pAdapter;
			adapter.on(eventName, function(data) {
				if (!data.broadcast || (adapter && !adapter.usePeerConnection) || data.webRTCUnsupportedClient) {
					callback.apply(this, arguments);
				}
			});
		} else {
			adapter = this.socketAdapter;
			adapter.on(eventName, callback);
		}
	}

	/**
	 * @param {string} eventName Event name to remove listener on
	 */
	off(eventName) {
		if (this.p2pAdapter) {
			this.p2pAdapter.removeListener(eventName);
		} else {
			this.socketAdapter.removeListener(eventName);
		}
	}

}
