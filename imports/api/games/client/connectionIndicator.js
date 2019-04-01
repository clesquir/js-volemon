import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';

let connectionIndicatorTimer;
export const updateConnectionIndicator = function(stream) {
	const setConnectionIndicatorClass = function() {
		let connectionIndicatorClass = 'connection-indicator-light-red';

		if (stream) {
			if (stream.connectedToP2P()) {
				connectionIndicatorClass = 'connection-indicator-light-green';
			} else if (stream.supportsP2P()) {
				connectionIndicatorClass = 'connection-indicator-light-yellow';
			}
		}

		Session.set('connection-indicator-class', connectionIndicatorClass);

		connectionIndicatorTimer = Meteor.setTimeout(setConnectionIndicatorClass, 1000);
	};

	connectionIndicatorTimer = Meteor.setTimeout(setConnectionIndicatorClass, 1000);
};

export const destroyConnectionIndicator = function() {
	Meteor.clearTimeout(connectionIndicatorTimer);
};
