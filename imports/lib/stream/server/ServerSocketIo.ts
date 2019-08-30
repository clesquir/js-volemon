import Stream from "../Stream";
import ServerP2P from "../../p2p/server/ServerP2P";
import SocketIo from "../../socket/SocketIo";
import Socket from "../../socket/Socket";

export default class ServerSocketIo implements Stream {
	private sockets;
	private socketsRoom;
	private socketBroadcasts;
	private broadcastedListeners;
	private listeners;
	private io;
	private p2pAdapter;

	init() {
		this.sockets = {};
		this.socketsRoom = {};
		this.socketBroadcasts = {};
		this.broadcastedListeners = {};
		this.listeners = {};

		const PORT = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${PORT};`);

		const express = require('express');
		const app = express();
		const server = require('http').createServer(app);
		this.io = require('socket.io')(server);
		this.p2pAdapter = new ServerP2P(this.socketsRoom);

		this.io.on('connection', (socket) => {
			this.sockets[socket.id] = socket;
			this.attachAllListeners(socket);

			socket.on('room', (room) => {
				socket.join(room);
				this.socketsRoom[socket.id] = room;

				this.p2pAdapter.attachHandshake(new SocketIo(socket), room);
			});

			socket.on('disconnect', () => {
				delete this.sockets[socket.id];
				delete this.socketsRoom[socket.id];
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

	connect(channel: string) {
	}

	disconnect(channel: string) {
	}

	supportsP2P(): boolean {
		return false;
	}

	connectedToP2P(): boolean {
		return false;
	}

	emit(eventName: string, payload) {
		this.io.emit(eventName, payload);
	}

	broadcastOnEvent(eventName: string) {
		this.broadcastedListeners[eventName] = true;

		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				let socket = sockets[socketId];
				socket.on(eventName, this.broadcastListener(eventName, socket));
			}
		}
	}

	on(eventName: string, callback: Function) {
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

	attachAllListeners(socket: Socket) {
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

	broadcastListener(eventName: string, socket): Function {
		if (this.socketBroadcasts[socket.id] === undefined) {
			this.socketBroadcasts[socket.id] = {};
		}

		const socketsRoom = this.socketsRoom;
		this.socketBroadcasts[socket.id][eventName] = function(data) {
			data.broadcast = true;

			socket.broadcast.to(socketsRoom[socket.id]).emit(eventName, data);
		};

		return this.socketBroadcasts[socket.id][eventName];
	}

	off(eventName: string) {
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
