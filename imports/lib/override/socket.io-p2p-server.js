const debug = require('debug')('socket');
const clients = {};

module.exports.clients = clients;
module.exports.Server = p2pSocket;

function p2pSocket (socket, next, room) {
	clients[socket.id] = socket;
	let connectedClients;
	if (typeof room === 'object') {
		connectedClients = socket.adapter.rooms[room.name].sockets;
	} else {
		connectedClients = clients;
	}
	socket.emit('numClients', Object.keys(connectedClients).length - 1);

	socket.on('disconnect', function () {
		delete clients[socket.id];
		Object.keys(connectedClients).forEach(function (clientId, i) {
			const client = clients[clientId];
			if (client) {
				client.emit('peer-disconnect', {peerId: socket.id});
			}
		});
		debug('Client gone (id=' + socket.id + ').');
	});

	socket.on('offers', function (data) {
		// send offers to everyone in a given room
		Object.keys(connectedClients).forEach(function (clientId, i) {
			const client = clients[clientId];
			if (client !== socket) {
				const offerObj = data.offers[i];
				if (offerObj) {
					const emittedOffer = {fromPeerId: socket.id, offerId: offerObj.offerId, offer: offerObj.offer};
					debug('Emitting offer: %s', JSON.stringify(emittedOffer));
					client.emit('offer', emittedOffer);
				}
			}
		});
	});

	socket.on('peer-signal', function (data) {
		const toPeerId = data.toPeerId;
		debug('Signal peer id %s', toPeerId);
		const client = clients[toPeerId];
		if (client) {
			client.emit('peer-signal', data);
		}
	});
	typeof next === 'function' && next();
}
