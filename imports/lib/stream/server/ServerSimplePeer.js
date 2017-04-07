import Stream from '/imports/lib/stream/Stream.js';

export default class ServerSimplePeer extends Stream {

	connect() {
		this.sockets = {};
		this.listeners = {};

		const PORT = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${PORT};`);

		const express = require('express');
		const app = express();
		const server = require('http').createServer(app);
		this.io = require('socket.io')(server);

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
		this.sockets = {};
		this.listeners = {};
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
	}

}
