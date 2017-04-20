import Stream from '/imports/lib/stream/Stream.js';
import p2pserver from '/imports/lib/override/socket.io-p2p-server.js';

export default class ServerSocketIo extends Stream {

	init() {
		this.sockets = {};
		this.broadcastedListeners = {};
		this.socketBroadcasts = {};
		this.listeners = {};

		const PORT = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${PORT};`);

		const express = require('express');
		const app = express();
		const server = require('http').createServer(app);
		this.io = require('socket.io')(server);
		const p2p = p2pserver.Server;

		this.io.on('connection', (socket) => {
			this.sockets[socket.id] = socket;
			this.attachAllListeners(socket);

			socket.on('room', (room) => {
				socket.join(room);
				p2p(socket, null, {name: room});
			});

			socket.on('disconnect', () => {
				delete this.sockets[socket.id];
				delete this.socketBroadcasts[socket.id];
			});
		});

		// Start server
		try {
			server.listen(PORT);
		} catch (e) {
			console.error(e);
		}
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		this.io.emit(eventName, payload);
	}

	/**
	 * @param {string} eventName
	 */
	broadcastOnEvent(eventName) {
		this.broadcastedListeners[eventName] = true;

		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				let socket = sockets[socketId];
				socket.on(eventName, this.broadcastListener(eventName, socket));
			}
		}
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
		if (this.listeners[eventName] === undefined) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callback);

		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				sockets[socketId].on(eventName, callback);
			}
		}
	}

	/**
	 * @param {Socket} socket
	 */
	attachAllListeners(socket) {
		/**
		 * Attach broadcasts
		 */
		for (let eventName in this.broadcastedListeners) {
			if (this.broadcastedListeners.hasOwnProperty(eventName)) {
				socket.on(eventName, this.broadcastListener(eventName, socket));
			}
		}

		/**
		 * Attach listeners
		 */
		for (let eventName in this.listeners) {
			if (this.listeners.hasOwnProperty(eventName)) {
				for (let listener of this.listeners[eventName]) {
					socket.on(eventName, listener);
				}
			}
		}
	}

	/**
	 * @param {string} eventName
	 * @param {Socket} socket
	 * @returns {Function}
	 */
	broadcastListener(eventName, socket) {
		if (this.socketBroadcasts[socket.id] === undefined) {
			this.socketBroadcasts[socket.id] = {};
		}

		this.socketBroadcasts[socket.id][eventName] = function(data) {
			data.broadcast = true;
			socket.broadcast.emit(eventName, data);
		};

		return this.socketBroadcasts[socket.id][eventName];
	}

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
		const sockets = this.sockets;

		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				/**
				 * Remove broadcasts
				 */
				if (this.socketBroadcasts[socketId] && this.socketBroadcasts[socketId][eventName]) {
					sockets[socketId].removeListener(eventName, this.socketBroadcasts[socketId][eventName]);
					delete this.socketBroadcasts[socketId][eventName];
				}

				/**
				 * Remove listeners
				 */
				if (this.listeners[eventName] !== undefined) {
					for (let listener of this.listeners[eventName]) {
						sockets[socketId].removeListener(eventName, listener);
					}
				}
			}
		}

		delete this.broadcastedListeners[eventName];
		delete this.listeners[eventName];
	}

}
