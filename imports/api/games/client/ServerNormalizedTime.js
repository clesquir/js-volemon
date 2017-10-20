import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ServerNormalizedTime {
	init() {
		this.serverOffset = TimeSync.serverOffset();
		this.timeSyncTimeout = Meteor.setInterval(() => {
			TimeSync.resync();
			this.serverOffset = TimeSync.serverOffset();
		}, 2500);
	}

	stop() {
		Meteor.clearInterval(this.timeSyncTimeout);
		this.serverOffset = undefined;
	}

	getServerTimestamp() {
		let serverOffset = 0;

		if (this.serverOffset !== undefined) {
			serverOffset = this.serverOffset;
		}

		return getUTCTimeStamp() + serverOffset;
	}
}
