export default class ServerP2P {
	constructor(socketsRoom) {
		this.socketsRoom = socketsRoom;

		this.clients = {};
	}

	/**
	 * @param {Socket} socket
	 * @param {String} roomName
	 */
	attachHandshake(socket, roomName) {
		const clients = this.clients;

		clients[socket.id()] = socket;
		let connectedClients;
		if (roomName !== undefined) {
			connectedClients = this.socketIdsInRoom(roomName);
		} else {
			connectedClients = clients;
		}

		socket.emit('numClients', Object.keys(connectedClients).length - 1);

		socket.on('disconnect', function() {
			delete clients[socket.id()];
			Object.keys(connectedClients).forEach(function(clientId) {
				const client = clients[clientId];
				if (client) {
					client.emit('peer-disconnect', {peerId: socket.id()});
				}
			});
		});

		socket.on('offers', function(data) {
			// send offers to everyone in a given room
			Object.keys(connectedClients).forEach(function(clientId, i) {
				const client = clients[clientId];
				if (client !== socket) {
					const offerObj = data.offers[i];
					if (offerObj) {
						client.emit(
							'offer',
							{
								fromSocketId: socket.id(),
								fromPeerId: socket.id(),
								offerId: offerObj.offerId,
								offer: offerObj.offer
							}
						);
					}
				}
			});
		});

		socket.on('peer-signal', function(data) {
			const toPeerId = data.toPeerId;
			const client = clients[toPeerId];
			if (client) {
				data.fromSocketId = socket.id();
				client.emit(
					'peer-signal',
					data
				);
			}
		});
	}

	/**
	 * @private
	 * @param {String} roomName
	 */
	socketIdsInRoom(roomName) {
		let socketIdsInRoom = {};

		for (let socketId in this.socketsRoom) {
			if (this.socketsRoom.hasOwnProperty(socketId) && this.socketsRoom[socketId] === roomName) {
				socketIdsInRoom[socketId] = true;
			}
		}

		return socketIdsInRoom;
	}
}
