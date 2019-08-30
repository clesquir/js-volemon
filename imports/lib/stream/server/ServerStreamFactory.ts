import Stream from "../Stream";
import ServerSocketIo from "./ServerSocketIo";
import ServerSocketCluster from "./ServerSocketCluster";
import NullStream from "../NullStream";

export default class ServerStreamFactory {
	static fromConfiguration(config: string): Stream {
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
