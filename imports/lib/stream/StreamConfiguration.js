import {Meteor} from 'meteor/meteor';

export default class StreamConfiguration {
	static alias() {
		const streamAlias = Meteor.settings.public.STREAM_ALIAS;
		if (streamAlias) {
			return streamAlias;
		}

		//this is the default
		return 'socketio';
	}
}
