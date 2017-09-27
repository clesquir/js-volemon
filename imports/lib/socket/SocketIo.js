import Socket from './Socket';

export default class SocketIo extends Socket {
	on(eventName, callback) {
		this.socket.on(eventName, callback);
	}

	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	}

	id() {
		return this.socket.id;
	}
}
