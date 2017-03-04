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
		this.adapter = this.socket;

		if (isWebRTCSupported) {
			this.p2p = new (require('socket.io-p2p'))(this.socket, {numClients: 10, autoUpgrade: true});
			this.p2p.on('ready', () => {
				this.p2p.usePeerConnection = true;
			});
			this.adapter = this.p2p;
		}
	}

	emit(eventName, payload) {
		this.adapter.emit(eventName, payload);
	}

	on(eventName, callback) {
		this.adapter.on(eventName, callback);
	}

	off(eventName) {
		this.adapter.removeListener(eventName);
	}

}
