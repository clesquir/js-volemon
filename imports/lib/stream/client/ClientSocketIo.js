import {Meteor} from 'meteor/meteor';
import Stream from '/imports/lib/stream/Stream.js';
import ClientP2P from '/imports/lib/p2p/client/ClientP2P.js';
import SocketIo from '/imports/lib/socket/SocketIo.js';

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
		this.p2pAdapter = new ClientP2P(new SocketIo(this.socketAdapter), Meteor.settings.public.iceServers);
		if (this.supportsP2P()) {
			this.p2pAdapter.connect();
		}

		this.socketAdapter.on('connect', () => {
			this.socketAdapter.emit('room', channel);
		});
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
		if (this.supportsP2P()) {
			this.p2pAdapter.disconnect();
		}
		this.socketAdapter.disconnect();
	}

	/**
	 * @return {boolean}
	 */
	connectedToP2P() {
		return this.p2pAdapter.connectedToP2P();
	}

	/**
	 * @return {boolean}
	 */
	supportsP2P() {
		return this.p2pAdapter.supportsP2P();
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		if (this.supportsP2P() && this.connectedToP2P()) {
			this.p2pAdapter.emit(eventName, payload);
		} else {
			payload.webRTCUnsupportedClient = true;
		}

		this.socketAdapter.emit(eventName, payload);
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
		if (this.supportsP2P()) {
			this.p2pAdapter.on(eventName, callback);
		} else {
			this.socketAdapter.on(eventName, callback);
		}
	}

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
		if (this.supportsP2P()) {
			this.p2pAdapter.off(eventName);
		}
		this.socketAdapter.removeListener(eventName);
	}
}
