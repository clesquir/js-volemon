import Stream from '/imports/lib/stream/Stream.js';

export default class ServerSocketIo extends Stream {

	connect() {
		const PORT = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${PORT};`);

		const express = require('express');
		const app = express();
		const server = require('http').createServer(app);
		this.io = require('socket.io')(server);
		const p2p = require('socket.io-p2p-server').Server;
		this.io.use(p2p);

		this.sockets = {};
		this.io.on('connection', (socket) => {
			this.sockets[socket.id] = socket;

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

	emit(eventName, payload) {
		this.io.emit(eventName, payload);
	}

	on(eventName, callback, broadcast) {
		const sockets = this.sockets;
		for (let socketId in sockets) {
			if (sockets.hasOwnProperty(socketId)) {
				sockets[socketId].on(eventName, function(data) {
					callback.call(this, data);
					if (broadcast) {
						sockets[socketId].broadcast.emit(eventName, data);
					}
				});
			}
		}
	}

	off(eventName) {
		for (let socketId in this.sockets) {
			if (this.sockets.hasOwnProperty(socketId)) {
				// this.sockets[socketId].removeListener(eventName);
			}
		}
	}

}
