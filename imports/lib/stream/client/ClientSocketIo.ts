import {Meteor} from 'meteor/meteor';
import Stream from "../Stream";
import ClientP2P from "../../p2p/client/ClientP2P";
import SocketIo from "../../socket/SocketIo";

export default class ClientSocketIo implements Stream {
	private socketAdapter;
	private p2pAdapter;

	init() {
	}

	connect(channel: string) {
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

	disconnect(channel: string) {
		if (this.supportsP2P()) {
			this.p2pAdapter.disconnect();
		}
		this.socketAdapter.disconnect();
	}

	connectedToP2P(): boolean {
		return this.p2pAdapter.connectedToP2P();
	}

	supportsP2P(): boolean {
		return this.p2pAdapter.supportsP2P();
	}

	emit(eventName: string, payload) {
		payload.fromSocketId = this.socketAdapter.id;

		if (this.supportsP2P()) {
			this.p2pAdapter.emit(eventName, payload);
		} else {
			payload.webRTCUnsupportedClient = true;
		}

		this.socketAdapter.emit(eventName, payload);
	}

	broadcastOnEvent(eventName: string) {
	}

	on(eventName: string, callback: Function) {
		if (this.supportsP2P()) {
			this.p2pAdapter.on(eventName, callback);
		} else {
			this.socketAdapter.on(eventName, callback);
		}
	}

	off(eventName: string) {
		if (this.supportsP2P()) {
			this.p2pAdapter.off(eventName);
		}
		this.socketAdapter.removeListener(eventName);
	}
}
