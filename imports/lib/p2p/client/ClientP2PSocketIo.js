import socketIOP2P from '/imports/lib/override/socket.io-p2p.js';
import {browserSupportsWebRTC} from '/imports/lib/utils.js';
import ClientP2P from './ClientP2P';

export default class ClientP2PSocketIo extends ClientP2P {
	constructor(socketAdapter) {
		super();
		this.socketAdapter = socketAdapter;
	}

	connect(iceServers) {
		this.usingPeerConnection = false;

		this.p2pAdapter = new (socketIOP2P)(
			this.socketAdapter,
			{
				numClients: 10,
				autoUpgrade: true,
				peerOpts: {
					config: {
						iceServers: iceServers
					}
				}
			}
		);
		this.p2pAdapter.onPeerError = () => {
			this.connect(this.socketAdapter, iceServers);
		};
	}

	disconnect() {
		this.p2pAdapter.disconnect();
	}

	/**
	 * @return {boolean}
	 */
	clientConnectedToP2P() {
		return this.usingPeerConnection;
	}

	/**
	 * @return {boolean}
	 */
	clientP2PAllowed() {
		return browserSupportsWebRTC();
	}

	emit(eventName, payload) {
		if (!this.p2pAdapter.usePeerConnection) {
			payload.webRTCUnsupportedClient = true;
			//Fallback already sends to server
			this.p2pAdapter.emit(eventName, payload);
		} else {
			//Emit to server for WebRTC unsupported clients
			this.socketAdapter.emit(eventName, payload);
			this.p2pAdapter.emit(eventName, payload);
		}

		this.usingPeerConnection = !!this.p2pAdapter.usePeerConnection;
	}

	on(eventName, callback) {
		const me = this;
		me.p2pAdapter.on(eventName, function(data) {
			if (me.allowP2PListener(me.p2pAdapter, data)) {
				callback.apply(this, arguments);
			}
		});
	}

	off(eventName) {
		this.p2pAdapter.removeListener(eventName);
	}

	/**
	 * @private
	 * @param adapter
	 * @param data
	 * @returns {boolean|*}
	 */
	allowP2PListener(adapter, data) {
		return (
			!data.broadcast ||
			(adapter && !adapter.usePeerConnection) ||
			data.webRTCUnsupportedClient
		);
	}
}
