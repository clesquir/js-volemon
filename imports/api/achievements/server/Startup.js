import ListenersInitiator from '/imports/api/achievements/server/ListenersInitiator.js';

export default class Startup {
	static start() {
		ListenersInitiator.init();
	}
}
