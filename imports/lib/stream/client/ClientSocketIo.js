import {Meteor} from 'meteor/meteor';
import Stream from '/imports/lib/stream/Stream.js';
import ClientP2PSocketIo from '/imports/lib/p2p/client/ClientP2PSocketIo.js';

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
		this.p2pAdapter = new ClientP2PSocketIo(this.socketAdapter);
		if (this.clientP2PAllowed()) {
			this.p2pAdapter.connect(Meteor.settings.public.iceServers);
		}

		this.socketAdapter.on('connect', () => {
			this.socketAdapter.emit('room', channel);
		});
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
		if (this.clientP2PAllowed()) {
			this.p2pAdapter.disconnect();
		}
		this.socketAdapter.disconnect();
	}

	/**
	 * @return {boolean}
	 */
	clientConnectedToP2P() {
		return this.p2pAdapter.clientConnectedToP2P();
	}

	/**
	 * @return {boolean}
	 */
	clientP2PAllowed() {
		return this.p2pAdapter.clientP2PAllowed();
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		if (this.clientP2PAllowed()) {
			this.p2pAdapter.emit(eventName, payload);
		} else {
			payload.webRTCUnsupportedClient = true;
			this.socketAdapter.emit(eventName, payload);
		}
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
		if (this.clientP2PAllowed()) {
			this.p2pAdapter.on(eventName, callback);
		} else {
			this.socketAdapter.on(eventName, callback);
		}
	}

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
		if (this.clientP2PAllowed()) {
			this.p2pAdapter.off(eventName);
		}
		this.socketAdapter.removeListener(eventName);
	}
}
