import ClientSocketCluster from '/imports/lib/stream/client/ClientSocketCluster.js';
import ClientSocketIo from '/imports/lib/stream/client/ClientSocketIo.js';

export default class ClientStreamFactory {
	/**
	 * @param config
	 * @returns {Stream}
	 */
	static fromConfiguration(config) {
		switch (config) {
			case 'socketio':
				return new ClientSocketIo();
			case 'socketcluster':
				return new ClientSocketCluster();
		}

		throw `stream ${config} not defined`;
	}
}
