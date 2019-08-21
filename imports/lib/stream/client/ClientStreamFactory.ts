import Stream from "../Stream";
import ClientSocketIo from "./ClientSocketIo";
import ClientSocketCluster from "./ClientSocketCluster";

export default class ClientStreamFactory {
	static fromConfiguration(config: string): Stream {
		switch (config) {
			case 'socketio':
				return new ClientSocketIo();
			case 'socketcluster':
				return new ClientSocketCluster();
		}

		throw `stream ${config} not defined`;
	}
}
