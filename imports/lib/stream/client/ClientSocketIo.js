import Stream from '/imports/lib/stream/Stream.js';
import socketIOP2P from '/imports/lib/override/socket.io-p2p.js';
const isWebRTCSupported = !!require('get-browser-rtc')();
const rtcSupport = require('webrtcsupport');

export default class ClientSocketIo extends Stream {

	/**
	 * @param {string} channel
	 */
	connect(channel) {
		// Socket io client
		const PORT = window.socketPort || 8080;
		let url = `http://localhost:${PORT}`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socketAdapter = require('socket.io-client').connect(url);
		if (isWebRTCSupported && rtcSupport.supportDataChannel) {
			this.connectP2pAdapter();

			this.socketAdapter.on('connect', () => {
				this.socketAdapter.emit('room', channel);
			});
		}
	}

	/**
	 * @private
	 */
	connectP2pAdapter() {
		this.p2pAdapter = new (socketIOP2P)(this.socketAdapter, {numClients: 10, autoUpgrade: true});
		this.p2pAdapter.on('peer-error', () => {
			this.connectP2pAdapter();
		});
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
		if (this.p2pAdapter) {
			this.p2pAdapter.disconnect();
		}
		this.socketAdapter.disconnect();
	}

	/**
	 * @param {string} eventName
	 * @param payload
	 */
	emit(eventName, payload) {
		if (this.p2pAdapter) {
			if (!this.p2pAdapter.usePeerConnection) {
				payload.webRTCUnsupportedClient = true;
				//Fallback already sends to server
				this.p2pAdapter.emit(eventName, payload);
			} else {
				//Emit to server for WebRTC unsupported clients
				this.socketAdapter.emit(eventName, payload);
				this.p2pAdapter.emit(eventName, payload);
			}
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
		}
		this.socketAdapter.removeListener(eventName);
	}

}
