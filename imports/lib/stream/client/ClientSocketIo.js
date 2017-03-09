import Stream from '/imports/lib/stream/Stream.js';

let isWebRTCSupported = false;
const rtcProperties = ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'];

for (let property of rtcProperties) {
	if (property in window) {
		isWebRTCSupported = true;
		break;
	}
}

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
		if (this.p2pAdapter) {
			this.p2pAdapter.on(eventName, function(data) {
				if (!data.broadcast || data.webRTCUnsupportedClient) {
					callback.apply(this, arguments);
				}
			});
		} else {
			this.socketAdapter.on(eventName, callback);
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
