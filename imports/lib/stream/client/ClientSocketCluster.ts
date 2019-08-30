import {Meteor} from 'meteor/meteor';
import Stream from "../Stream";
import {browserSupportsWebRTC} from "../../utils";

export default class ClientSocketCluster implements Stream {
	private socketAdapter;

	init() {
	}

	connect(channel: string) {
		const port = window.socketPort || 8080;
		let url = `localhost`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socketAdapter = require('socketcluster-client').connect({
			hostname: url,
			port: port
		});
		if (this.supportsP2P()) {
			//p2p needs to be implemented
		}

		this.socketAdapter.on('connect', () => {
			this.socketAdapter.emit('room', channel);
		});
	}

	disconnect(channel: string) {
		this.socketAdapter.off('connect');
		this.socketAdapter.disconnect();
	}

	connectedToP2P(): boolean {
		return false;
	}

	supportsP2P(): boolean {
		return browserSupportsWebRTC();
	}

	emit(eventName: string, payload) {
		payload.webRTCUnsupportedClient = true;
		this.socketAdapter.emit(eventName, payload);
	}

	broadcastOnEvent(eventName: string) {
	}

	on(eventName: string, callback: Function) {
		this.socketAdapter.on(eventName, callback);
	}

	off(eventName: string) {
		this.socketAdapter.off(eventName);
	}
}
