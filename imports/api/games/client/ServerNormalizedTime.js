import {TimeSync} from 'meteor/mizzao:timesync';
import {getUTCTimeStamp} from '/imports/lib/utils.js';

export default class ServerNormalizedTime {

	constructor() {
		this.serverOffset = TimeSync.serverOffset();
	}

	getServerNormalizedTimestamp() {
		return getUTCTimeStamp() + this.serverOffset;
	}

}
