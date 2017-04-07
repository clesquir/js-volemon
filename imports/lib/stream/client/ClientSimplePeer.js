import Stream from '/imports/lib/stream/Stream.js';
const SocketIo = require('socket.io-client');
const SimplePeer = require('simple-peer');
const RtcSupport = require('webrtcsupport');
const hat = require('hat');
const Buffer = require('buffer/').Buffer;

export default class ClientSimplePeer extends Stream {

	connect(channel) {
		/**
		 * Socket io
		 */
		const PORT = window.socketPort || 8080;
		let url = `http://localhost:${PORT}`;
		if (Meteor.settings.public.SOCKET_URL) {
			url = Meteor.settings.public.SOCKET_URL;
		}

		this.socketAdapter = SocketIo.connect(url);

		if (RtcSupport.supportDataChannel) {
			const peerId = hat(160);
			this.peers = {};
			this.events = {};

			this.socketAdapter.on('offers-' + channel, (data) => {
				const peer = new SimplePeer({
					initiator: false,
					channelName: channel,
					trickle: false
				});
				peer.setMaxListeners(50);

				peer.on('error', function(err) {
					console.log('new peer error', err);
				});

				peer.on('signal', (signalData) => {
					this.socketAdapter.emit('peerSignal-' + channel, {
						offer: signalData,
						offerId: data.offerId,
						fromPeerId: peerId,
						toPeerId: data.fromPeerId
					});
				});

				peer.on('data', (data) => {
					this.onPeerData(data);
				});

				this.peers[data.fromPeerId] = peer;

				if (!peer.destroyed) {
					peer.signal(data.offer);
				}
			});

			this.socketAdapter.on('peerSignal-' + channel, (data) => {
				if (data.toPeerId === peerId) {
					const peer = this.peers[data.offerId] || this.peers[data.fromPeerId];

					peer.on('signal', (signalData) => {
						this.socketAdapter.emit('peerSignal-' + channel, {
							offer: signalData,
							offerId: data.offerId,
							fromPeerId: peerId,
							toPeerId: data.fromPeerId
						});
					});

					if (!peer.destroyed) {
						peer.signal(data.offer);
					}
				}
			});

			/**
			 * Peer
			 */
			const initialPeerId = hat(160);
			const initialPeer = new SimplePeer({
				initiator: true,
				channelName: channel,
				trickle: false
			});
			initialPeer.setMaxListeners(50);

			initialPeer.on('error', function(err) {
				console.log('initial peer error', err);
			});

			initialPeer.on('signal', (offer) => {
				this.socketAdapter.emit('offers-' + channel, {
					offer: offer,
					offerId: initialPeerId,
					fromPeerId: peerId
				});
			});

			initialPeer.on('data', (data) => {
				this.onPeerData(data);
			});

			this.peers[initialPeerId] = initialPeer;
		}
	}

	onPeerData(data) {
		const buf = Buffer.from(data);
		const parsedData = JSON.parse(buf.toString());

		for (let eventName in this.events) {
			if (this.events.hasOwnProperty(eventName) && parsedData.eventName === eventName) {
				this.events[eventName](parsedData.payload);
			}
		}
	}

	disconnect() {
		if (RtcSupport.supportDataChannel) {
			for (let peerId in this.peers) {
				if (this.peers.hasOwnProperty(peerId)) {
					this.peers[peerId].destroy();
				}
			}
		}
		this.socketAdapter.disconnect();
		this.socketAdapter.destroy();
	}

	emit(eventName, payload) {
		// this.socketAdapter.emit(eventName, payload);
		if (RtcSupport.supportDataChannel) {
			for (let peerId in this.peers) {
				if (this.peers.hasOwnProperty(peerId)) {
					const peer = this.peers[peerId];
					if (peer._channelReady && peer._channel && peer._channel.readyState === 'open') {
						peer.send(JSON.stringify({eventName: eventName, payload: payload}));
					}
				}
			}
		}
	}

	on(eventName, callback) {
		this.socketAdapter.on(eventName, callback);
		this.events[eventName] = callback;
	}

	off(eventName) {
		delete this.events[eventName];
	}

}
