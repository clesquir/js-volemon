import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import NormalizedTime from "./NormalizedTime";

export default class ClientServerOffsetNormalizedTime implements NormalizedTime {
	serverOffset: number;
	private timeSyncTimeout: number;

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

	getTime(): number {
		let serverOffset = 0;

		if (this.serverOffset !== undefined) {
			serverOffset = this.serverOffset;
		}

		return Date.now() + serverOffset;
	}
}
