global.Buffer = global.Buffer || require("buffer").Buffer; // eslint-disable-line
const Peer = require('simple-peer');
const Emitter = require('component-emitter');
const parser = require('socket.io-parser');
const toArray = require('to-array');
const hasBin = require('has-binary');
const bind = require('component-bind');
const hat = require('hat');
import {browserSupportsWebRTC, isObjectEmpty} from '/imports/lib/utils.js';

export default class ClientP2P {
	/**
	 * @param {Socket} socket
	 * @param {String} iceServers
	 */
	constructor(socket, iceServers) {
		this.socket = socket;
		this.iceServers = iceServers;
		this.onP2PListeners = {};

		this.emitfn = Emitter.prototype.emit;
		this.addEventListener = Emitter.prototype.addEventListener;
		this.removeEventListener = Emitter.prototype.removeEventListener;
		this.decoder = new parser.Decoder(this);
		this.decoder.on('decoded', bind(this, this.ondecoded));
		this._peerEvents = {
			upgrade: 1,
			downgrade: 1,
			error: 1,
			peer_signal: 1,
			peer_ready: 1,
			stream: 1
		};
		this.opts = {
			autoUpgrade: true,
			numClients: 10
		};
		this.peerOpts = {
			config: {
				iceServers: this.iceServers
			}
		};
	}

	connect() {
		this.usePeerConnection = false;
		this._peers = {};
		this.readyPeers = {};
		this.ready = false;
		this.numConnectedClients = 0;

		this.socket.on('numClients', (numClients) => {
			this.peerId = this.socket.id();
			this.numConnectedClients = numClients;

			this.generateOffers((offers) => {
				this.socket.emit('offers', {
					offers: offers,
					fromPeerId: this.peerId
				});
			});
		});

		this.socket.on('offer', (data) => {
			const peerOpts = Object.assign(this.peerOpts, {initiator: false});
			const peer = this._peers[data.fromPeerId] = new Peer(peerOpts);
			peer.id = data.fromPeerId;
			peer.fromSocketId = data.fromSocketId;
			this.numConnectedClients++;
			peer.setMaxListeners(50);
			this.setupPeerEvents(peer);
			peer.on('signal', (signalData) => {
				this.socket.emit('peer-signal', {
					signal: signalData,
					offerId: data.offerId,
					fromPeerId: this.peerId,
					toPeerId: data.fromPeerId
				});
			});

			peer.on('error', (err) => {
				this.emitfn.call(this, 'peer-error', err);
			});
			if (!peer.destroyed) {
				peer.signal(data.offer);
			}
		});

		this.socket.on('peer-signal', (data) => {
			// Select peer from offerId if exists
			const peer = this._peers[data.offerId] || this._peers[data.fromPeerId];

			if (!peer) {
				return;
			}

			peer.fromSocketId = data.fromSocketId;

			peer.on('signal', (signalData) => {
				this.socket.emit('peer-signal', {
					signal: signalData,
					offerId: data.offerId,
					fromPeerId: this.peerId,
					toPeerId: data.fromPeerId
				});
			});

			if (!peer.destroyed) {
				peer.signal(data.signal);
			}
		});

		this.socket.on('peer-disconnect', (peer) => {
			this.disconnectPeer(peer);
		});

		this.onP2P('peer_ready', (peer) => {
			this.readyPeers[peer.fromSocketId] = true;

			const localPeer = this._peers[peer.id];
			if (localPeer) {
				localPeer.hasInitiated = true;
			}

			if (!isObjectEmpty(this.readyPeers) && !this.ready) {
				this.ready = true;
				if (this.opts.autoUpgrade) this.usePeerConnection = true;
				this.emitP2P('upgrade');
			}
		});
	}

	disconnectPeer(peer) {
		if (this.readyPeers[peer.fromSocketId]) {
			delete this.readyPeers[peer.fromSocketId];
			this.numConnectedClients--;
		}

		if (this._peers[peer.id]) {
			this._peers[peer.id].destroy();
			delete this._peers[peer.id];
		}

		if (isObjectEmpty(this.readyPeers) && this.ready) {
			this.ready = false;
			this.usePeerConnection = false;
			this.emitP2P('downgrade');
		}
	}

	disconnect() {
		for (let peerId in this._peers) {
			if (this._peers.hasOwnProperty(peerId)) {
				const peer = this._peers[peerId];
				peer.destroy();
			}
		}

		this._peers = {};
	}

	/**
	 * @return {boolean}
	 */
	connectedToP2P() {
		return this.usePeerConnection;
	}

	/**
	 * @return {boolean}
	 */
	supportsP2P() {
		if (this.hasP2PSupport === undefined) {
			this.hasP2PSupport = browserSupportsWebRTC();
		}

		return this.hasP2PSupport;
	}

	emit(eventName, payload) {
		this.emitP2P(eventName, payload);
	}

	on(eventName, callback) {
		if (this.onP2PListeners[eventName] === undefined) {
			this.onP2PListeners[eventName] = [];
		}
		this.onP2PListeners[eventName].push(callback);

		this.addP2PListener(eventName, callback);
	}

	addP2PListener(eventName, callback) {
		const me = this;

		me.onP2P(eventName, function(data) {
			if (me.allowP2PListener(data)) {
				callback.apply(this, arguments);
			}
		});
	}

	off(eventName) {
		this.removeEventListener(eventName);
	}

	/**
	 * @private
	 * @param data
	 * @returns {boolean|*}
	 */
	allowP2PListener(data) {
		return (
			!data.broadcast ||
			data.webRTCUnsupportedClient ||
			(this.readyPeers[data.fromSocketId] && !data.broadcast) ||
			!this.readyPeers[data.fromSocketId]
		);
	}

	/**
	 * @private
	 * @param cb
	 */
	generateOffers(cb) {
		this.offers = [];
		for (let i = 0; i < this.opts.numClients; ++i) {
			this.generateOffer(cb);
		}
	}

	/**
	 * @private
	 * @param cb
	 */
	generateOffer(cb) {
		const offerId = hat(160);
		const peerOpts = Object.assign(this.peerOpts, {initiator: true});
		const peer = this._peers[offerId] = new Peer(peerOpts);
		peer.id = offerId;
		peer.setMaxListeners(50);
		this.setupPeerEvents(peer);
		peer.on('signal', (offer) => {
			this.offers.push({
				offer: offer,
				offerId: offerId
			});
			this.checkDone(cb);
		});

		peer.on('error', (err) => {
			this.emitfn.call(this, 'peer-error', err);
		});
	}

	/**
	 * @private
	 * @param cb
	 */
	checkDone(cb) {
		if (this.offers.length === this.opts.numClients) {
			cb(this.offers);
		}
	}

	/**
	 * @private
	 * @param peer
	 */
	setupPeerEvents(peer) {
		const self = this;

		peer.on('connect', function() {
			self.emitP2P(
				'peer_ready',
				{
					peerId: peer.id,
					fromSocketId: peer.fromSocketId
				}
			);
		});

		peer.on('data', function(data) {
			if (this.destroyed) return;
			if (hasBin(data)) {
				data = data.toString();
			}
			self.decoder.add(data);
		});

		peer.on('stream', function(stream) {
			self.emitP2P('stream', stream);
		});
	}

	onP2P(type, listener) {
		this.socket.on(type, (data) => {
			this.emitfn.call(this, type, data);
		});
		this.addEventListener(type, listener);
	}

	emitP2P(data, cb) {
		const self = this;
		const encoder = new parser.Encoder();

		if (this._peerEvents.hasOwnProperty(data)) {
			this.emitfn.apply(this, arguments);
		} else if (this.usePeerConnection) {
			const args = toArray(arguments);
			let parserType = parser.EVENT; // default
			if (hasBin(args)) {
				parserType = parser.BINARY_EVENT;
			} // binary
			const packet = {type: parserType, data: args};

			encoder.encode(packet, function(encodedPackets) {
				if (encodedPackets[1] instanceof ArrayBuffer) {
					self._sendArray(encodedPackets);
				} else if (encodedPackets) {
					for (let i = 0; i < encodedPackets.length; i++) {
						self._send(encodedPackets[i]);
					}
				} else {
					throw new Error('Encoding error');
				}
			});
		}
	}

	_sendArray(arr) {
		const firstPacket = arr[0];
		const interval = 5000;
		const arrLength = arr[1].byteLength;
		const nChunks = Math.ceil(arrLength / interval);
		const packetData = firstPacket.substr(0, 1) + nChunks + firstPacket.substr(firstPacket.indexOf('-'));
		this._send(packetData);
		this.binarySlice(arr[1], interval, this._send);
	}

	_send(data) {
		const self = this;
		for (let peerId in self._peers) {
			if (self._peers.hasOwnProperty(peerId)) {
				const peer = self._peers[peerId];
				if (peer._channelReady && peer._channel && peer._channel.readyState === 'open') {
					try {
						peer.send(data);
					} catch (e) {
						self.onPeerError(peer);
					}
				} else {
					self.onReadyPeerNotReady(peer);
				}
			}
		}
	}

	onPeerError(peer) {
		if (peer.fromSocketId && peer.hasInitiated) {
			this.disconnectPeer(peer);
		}
	}

	onReadyPeerNotReady(peer) {
		if (peer.fromSocketId && peer.hasInitiated) {
			this.disconnectPeer(peer);
		}
	}

	binarySlice(arr, interval, callback) {
		for (let start = 0; start < arr.byteLength; start += interval) {
			const chunk = arr.slice(start, start + interval);
			callback.call(this, chunk);
		}
	}

	ondecoded(packet) {
		const args = packet.data || [];
		this.emitfn.apply(this, args);
	}

	upgrade() {
		this.usePeerConnection = true;
	}
}
