import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ServerNormalizedTime {
	init() {
		this.serverOffsets = [];
		this.serverOffset = TimeSync.serverOffset();
		this.serverOffsets.push(this.serverOffset);
		this.timeSyncTimeout = Meteor.setInterval(() => {
			TimeSync.resync();
			this.serverOffset = TimeSync.serverOffset();
			this.serverOffsets.push(this.serverOffset);
		}, 2500);
	}

	stop() {
		Meteor.clearInterval(this.timeSyncTimeout);
		this.serverOffset = undefined;
	}

	getServerTimestamp() {
		let serverOffset = 0;

		if (this.serverOffsets.length) {
			const sum = this.serverOffsets.reduce((previous, current) => current += previous);
			serverOffset = sum / this.serverOffsets.length;
		}

		return getUTCTimeStamp() + serverOffset;
	}
}
