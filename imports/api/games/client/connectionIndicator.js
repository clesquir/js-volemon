import {Meteor} from 'meteor/meteor';
import {Session} from 'meteor/session';
import {stream} from '/imports/api/games/client/routeInitiator.js';

let connectionIndicatorTimer;
export const updateConnectionIndicator = function() {
	const setConnectionIndicatorClass = function() {
		let connectionIndicatorClass = 'connection-indicator-light-gray';

		if (stream) {
			if (stream.usingPeerConnection) {
				connectionIndicatorClass = 'connection-indicator-light-green';
			} else if (stream.usingP2P) {
				connectionIndicatorClass = 'connection-indicator-light-yellow';
			} else if (stream.usingSocket) {
				connectionIndicatorClass = 'connection-indicator-light-red';
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
