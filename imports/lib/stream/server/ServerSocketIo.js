import Stream from '/imports/lib/stream/Stream.js';
import p2pserver from '/imports/lib/override/socket.io-p2p-server.js';

export default class ServerSocketIo extends Stream {

	constructor(...args) {
		super(...args);
		this.sockets = {};
		this.listeners = {};
	}

	connect() {
		const PORT = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${PORT};`);

		const express = require('express');
		const app = express();
		const server = require('http').createServer(app);
		this.io = require('socket.io')(server);
		const p2p = p2pserver.Server;
		this.io.use(p2p);

		this.io.on('connection', (socket) => {
			this.sockets[socket.id] = socket;
			this.attachListeners(socket);

			socket.on('disconnect', () => {
				delete this.sockets[socket.id];
			});
		});

		// Start server
		try {
			server.listen(PORT);
		} catch (e) {
			console.error(e);
		}
	}

	disconnect() {
	}

	/**
	 * @param {string} eventName
	 * @param payload
	 */
	emit(eventName, payload) {
		this.io.emit(eventName, payload);
	}

	/**
	 * @param {string} eventName
	 * @param callback
	 * @param {boolean} broadcast Broadcast to all sockets if true
	 */
	on(eventName, callback, broadcast) {
		this.listeners[eventName] = {
			callback: callback,
			broadcast: broadcast
		};

		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				this.attachListeners(sockets[socketId]);
			}
		}
	}

	attachListeners(socket) {
		for (let eventName in this.listeners) {
			if (this.listeners.hasOwnProperty(eventName)) {
				const callback = this.listeners[eventName].callback;
				const broadcast = this.listeners[eventName].broadcast;
				socket.on(eventName, function(data) {
					callback.call(this, data);
					if (broadcast) {
						data.broadcast = true;
						socket.broadcast.emit(eventName, data);
					}
				});
			}
		}
	}

	/**
	 * @param {string} eventName Event name to remove listener on
	 */
	off(eventName) {
		for (let socketId in this.sockets) {
			if (this.sockets.hasOwnProperty(socketId)) {
				// this.sockets[socketId].removeListener(eventName);
			}
		}
		this.sockets = {};
		this.listeners = {};
	}

}
