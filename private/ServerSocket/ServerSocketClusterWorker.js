'use strict';

const SCWorker = require('socketcluster/scworker');

class Worker extends SCWorker {
	run() {
		const app = require('express')();

		const httpServer = this.httpServer;
		const scServer = this.scServer;

		httpServer.on('request', app);

		const serverWorker = new ServerSocketClusterWorker(this, scServer);
		serverWorker.init();
	}
}

new Worker();

class ServerSocketClusterWorker {
	constructor(worker, server) {
		this.worker = worker;
		this.server = server;
		this.sockets = {};
		this.socketsRoom = {};
		this.broadcastedListeners = {};
		this.socketBroadcasts = {};
		this.listeners = [];
	}

	init() {
		this.worker.on('masterMessage', (data, respond) => {
			switch (data.action) {
				case 'emit':
					this.emit(data.eventName, data.payload);
					break;
				case 'broadcastOnEvent':
					this.broadcastOnEvent(data.eventName);
					break;
				case 'on':
					this.on(data.eventName);
					break;
				case 'off':
					this.off(data.eventName);
					break;
				default:
					respond(null);
					break;
			}
			respond();
		});

		this.server.on('connection', (socket) => {
			this.sockets[socket.id] = socket;
			this.attachAllListeners(socket);

			socket.on('room', (room) => {
				this.socketsRoom[socket.id] = room;
			});

			socket.on('disconnect', () => {
				delete this.sockets[socket.id];
				delete this.socketsRoom[socket.id];
				delete this.socketBroadcasts[socket.id];
			});
		});
	}

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				let socket = sockets[socketId];
				socket.emit(eventName, payload);
			}
		}
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
	 */
	on(eventName) {
		if (this.listeners[eventName] === undefined) {
			this.listeners[eventName] = (payload) => {
				this.worker.sendToMaster(
					{
						eventName: eventName,
						payload: payload
					}
				);
			};

			const sockets = this.sockets;
			for (let socketId in sockets) {
				if (sockets.hasOwnProperty(socketId)) {
					sockets[socketId].on(eventName, this.listeners[eventName]);
				}
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
		for (let eventName of this.listeners) {
			socket.on(eventName, this.listeners[eventName]);
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

		const worker = this;
		this.socketBroadcasts[socket.id][eventName] = function(data) {
			data.broadcast = true;

			worker.broadcastToSameRoomSockets(worker, socket, eventName, data);
		};

		return this.socketBroadcasts[socket.id][eventName];
	}

	/**
	 * @private
	 * @param worker
	 * @param socket
	 * @param eventName
	 * @param data
	 */
	broadcastToSameRoomSockets(worker, socket, eventName, data) {
		for (let socketId in worker.sockets) {
			if (
				worker.sockets.hasOwnProperty(socketId) &&
				socketId !== socket.id &&
				worker.socketsRoom[socketId] === worker.socketsRoom[socket.id]
			) {
				worker.sockets[socketId].emit(eventName, data);
			}
		}
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
					sockets[socketId].removeListener(eventName, this.listeners[eventName]);
				}
			}
		}

		delete this.broadcastedListeners[eventName];
		delete this.listeners[eventName];
	}
}
