import Stream from "../Stream";

export default class ServerSocketCluster implements Stream {
	private sockets;
	private broadcastedListeners;
	private socketBroadcasts;
	private listeners;
	private socketCluster;
	private workerIds: string[];

	init() {
		this.sockets = {};
		this.broadcastedListeners = {};
		this.socketBroadcasts = {};
		this.listeners = {};

		const port = 8080;

		// Client-side config
		WebAppInternals.addStaticJs(`window.socketPort = ${port};`);

		const SocketCluster = require('socketcluster');
		this.socketCluster = new SocketCluster({
			workers: 1,
			brokers: 1,
			port: port,
			appName: 'volemon',
			wsEngine: 'uws',
			rebootWorkerOnCrash: true,
			workerController: Assets.absoluteFilePath('ServerSocket/ServerSocketClusterWorker.js'),
			brokerController: Assets.absoluteFilePath('ServerSocket/ServerSocketClusterBroker.js')
		});

		this.workerIds = [];
		this.socketCluster.on('workerStart', (worker) => {
			this.workerIds.push(worker.id);
		});
		this.socketCluster.on('workerExit', (worker) => {
			const index = this.workerIds.indexOf(worker.id);
			if (index !== -1) {
				this.workerIds.splice(index, 1);
			}
		});
		this.socketCluster.on('workerMessage', (worker, data) => {
			for (let listener of this.listeners[data.eventName]) {
				listener.call(this, data.payload);
			}
		});

		//p2p needs to be implemented
	}

	connect(channel: string) {
	}

	disconnect(channel: string) {
	}

	supportsP2P(): boolean {
		return false;
	}

	connectedToP2P(): boolean {
		return false;
	}

	emit(eventName: string, payload) {
		this.sendToWorkers(
			{
				action: 'emit',
				eventName: eventName,
				payload: payload
			}
		);
	}

	broadcastOnEvent(eventName: string) {
		this.sendToWorkers(
			{
				action: 'broadcastOnEvent',
				eventName: eventName
			}
		);
	}

	on(eventName: string, callback: Function) {
		if (this.listeners[eventName] === undefined) {
			this.listeners[eventName] = [];
		}
		this.listeners[eventName].push(callback);

		this.sendToWorkers(
			{
				action: 'on',
				eventName: eventName
			}
		);
	}

	off(eventName: string) {
		this.sendToWorkers(
			{
				action: 'off',
				eventName: eventName
			}
		);
	}

	private sendToWorkers(data) {
		for (let workerId of this.workerIds) {
			this.socketCluster.sendToWorker(workerId, data);
		}
	}
}
