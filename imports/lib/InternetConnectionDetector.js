import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";

const testInterval = 2500;

export default class InternetConnectionDetector {
	static start() {
		Meteor.setInterval(() => {
			if (!navigator.onLine) {
				Session.set('noInternetConnectionDetected', true);
			} else {
				Session.set('noInternetConnectionDetected', !hostReachable());
			}
		}, testInterval);
	}
}

const hostReachable = function() {
	const xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
	let server = window.location.hostname;
	if (window.location.port !== '') {
		server += ':' + window.location.port;
	}

	xhr.open("HEAD", "//" + server + "/?rand=" + (new Date().getTime()), false);

	try {
		xhr.send();
		return (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304);
	} catch (error) {
		return false;
	}
};
