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
		if (browserSupportsWebRTC()) {
			//@todo implement
		}

		this.socketAdapter.on('connect', function() {});

		this.usingSocket = false;
		this.usingP2P = false;
		this.usingPeerConnection = false;
	}

	/**
	 * @param {string} channel
	 */
	disconnect(channel) {
		this.socketAdapter.disconnect();
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		payload.webRTCUnsupportedClient = true;
		this.socketAdapter.emit(eventName, payload);

		this.usingP2P = false;
		this.usingPeerConnection = false;
		this.usingSocket = true;
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
