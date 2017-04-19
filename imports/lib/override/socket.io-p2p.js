export default class socketIOP2P extends require('socket.io-p2p') {
	_send(data) {
		const self = this;
		for (let peerId in self._peers) {
			if (self._peers.hasOwnProperty(peerId)) {
				const peer = self._peers[peerId];
				if (peer._channelReady && peer._channel && peer._channel.readyState === 'open') {
					try {
						peer.send(data);
					} catch (e) {
						self.onPeerError(e);
					}
				}
			}
		}
	}

	onPeerError(e) {
	}
}
