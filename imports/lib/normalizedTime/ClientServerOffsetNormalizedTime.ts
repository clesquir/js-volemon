import {Meteor} from 'meteor/meteor';
import {TimeSync} from 'meteor/mizzao:timesync';
import NormalizedTime from "./NormalizedTime";

export default class ClientServerOffsetNormalizedTime implements NormalizedTime {
	private static instance: ClientServerOffsetNormalizedTime;
	private serverOffset: number;
	private timeSyncTimeout: number;

	static get(): ClientServerOffsetNormalizedTime {
		if (!this.instance) {
			this.instance = new ClientServerOffsetNormalizedTime();
		}

		return this.instance;
	}

	init() {
		this.stop();

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
		return Date.now() + this.getOffset();
	}

	getOffset(): number {
		let serverOffset = 0;

		if (this.serverOffset !== undefined) {
			serverOffset = this.serverOffset;
		}

		return serverOffset;
	}
}
