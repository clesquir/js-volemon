import NullStream from '/imports/lib/stream/NullStream.js';
import ServerSocketCluster from '/imports/lib/stream/server/ServerSocketCluster.js';
import ServerSocketIo from '/imports/lib/stream/server/ServerSocketIo.js';

export default class ServerStreamFactory {
	/**
	 * @param config
	 * @returns {Stream}
	 */
	static fromConfiguration(config) {
		switch (config) {
			case 'socketio':
				return new ServerSocketIo();
			case 'socketcluster':
				return new ServerSocketCluster();
			case 'null':
				return new NullStream();
		}

		throw `stream ${config} not defined`;
	}
}
