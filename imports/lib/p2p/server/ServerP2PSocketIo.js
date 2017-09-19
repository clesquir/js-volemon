import p2pserver from '/imports/lib/override/socket.io-p2p-server.js';
import ServerP2P from './ServerP2P';

export default class ServerP2PSocketIo extends ServerP2P {
	constructor() {
		super();
		this.p2pAdapter = p2pserver.Server;
	}

	attachHandshake(socket, room) {
		this.p2pAdapter(socket, null, {name: room});
	}
}
