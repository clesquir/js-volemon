import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ServerNormalizedTime {
	init() {
		this.serverOffset = TimeSync.serverOffset();
		this.serverRoundTripTime = TimeSync.roundTripTime();
		this.timeSyncTimeout = Meteor.setInterval(() => {
			TimeSync.resync();
			this.serverOffset = TimeSync.serverOffset();
			this.serverRoundTripTime = TimeSync.roundTripTime();
		}, 2500);
	}

	stop() {
		Meteor.clearInterval(this.timeSyncTimeout);
		this.serverOffset = undefined;
		this.serverRoundTripTime = undefined;
	}

	getServerNormalizedTimestamp() {
		let serverOffset = 0;

		if (this.serverOffset !== undefined) {
			serverOffset = this.serverOffset;
		}

		return getUTCTimeStamp() + serverOffset;
	}

	getServerNormalizedTimestampForInterpolation() {
		let serverOffset = 0;
		let serverRoundTripTime = 0;

		if (this.serverOffset !== undefined) {
			serverOffset = this.serverOffset;
		}

		if (this.serverRoundTripTime !== undefined) {
			serverRoundTripTime = this.serverRoundTripTime;
		}

		return getUTCTimeStamp() + serverOffset + serverRoundTripTime;
	}
}
