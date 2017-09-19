import {Meteor} from 'meteor/meteor';
import Stream from '/imports/lib/stream/Stream.js';
import {browserSupportsWebRTC} from '/imports/lib/utils.js';

export default class ClientSocketCluster extends Stream {
	/**
	 * @param {string} channel
	 */
	connect(channel) {
		const port = window.socketPort || 8080;
		let url = `localhost`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socketAdapter = require('socketcluster-client').connect({
			hostname: url,
			port: port
		});
		if (this.clientP2PAllowed()) {
			//@todo implement
		}

		this.socketAdapter.on('connect', () => {
			this.socketAdapter.emit('room', channel);
		});
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
		this.socketAdapter.off('connect');
		this.socketAdapter.disconnect();
	}

	/**
	 * @return {boolean}
	 */
	clientConnectedToP2P() {
		return false;
	}

	/**
	 * @return {boolean}
	 */
	clientP2PAllowed() {
		return browserSupportsWebRTC();
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		payload.webRTCUnsupportedClient = true;
		this.socketAdapter.emit(eventName, payload);
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
		this.socketAdapter.on(eventName, callback);
	}

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
		this.socketAdapter.off(eventName);
	}
}
