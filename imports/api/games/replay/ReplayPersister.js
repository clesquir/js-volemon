import {Meteor} from 'meteor/meteor';
import {Replays} from '/imports/api/games/replays.js';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ReplayPersister {
	constructor(gameId, stream) {
		this.gameId = gameId;
		this.stream = stream;
	}

	init() {
	}

	start() {
		this.stream.on('sendBundledData-' + this.gameId, Meteor.bindEnvironment(this.persistBundledData));
	}

	stop() {
	}

	persistBundledData(bundledData) {
		Replays.insert({
			gameId: this.gameId,
			timestamp: getUTCTimeStamp(),
			bundledData: bundledData
		});
	}
}
