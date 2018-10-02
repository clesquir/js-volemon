import Stream from '/imports/lib/stream/Stream.js';

export default class ServerSocketCluster extends Stream {
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

	/**
	 * @param {string} eventName
	 * @param {*} payload
	 */
	emit(eventName, payload) {
		this.sendToWorkers(
			{
				action: 'emit',
				eventName: eventName,
				payload: payload
			}
		);
	}

	/**
	 * @param {string} eventName
	 */
	broadcastOnEvent(eventName) {
		this.sendToWorkers(
			{
				action: 'broadcastOnEvent',
				eventName: eventName
			}
		);
	}

	/**
	 * @param {string} eventName
	 * @param {Function} callback
	 */
	on(eventName, callback) {
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

	/**
	 * @param {string} eventName Event name to remove listeners on
	 */
	off(eventName) {
		this.sendToWorkers(
			{
				action: 'off',
				eventName: eventName
			}
		);
	}

	sendToWorkers(data) {
		for (let workerId of this.workerIds) {
			this.socketCluster.sendToWorker(workerId, data);
		}
	}
}
