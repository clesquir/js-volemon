import SpeedTest from '/imports/lib/speedTest/SpeedTest.js';
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";

const speedTestInterval = 1000;
const weakConnectionThreshold = 250;

export default class WeakConnectionDetector {
	static start() {
		const speedTest = new SpeedTest();

		Meteor.setInterval(() => {
			if (!navigator.onLine) {
				Session.set('weakConnectionDetected', true);
			} else {
				if (navigator.connection) {
					const connectionSpeed = navigator.connection.downlink * 1000;
					Session.set('weakConnectionDetected', (connectionSpeed < weakConnectionThreshold));
				} else {
					speedTest.check(function(connectionSpeed) {
						Session.set('weakConnectionDetected', (connectionSpeed < weakConnectionThreshold));
					});
				}
			}
		}, speedTestInterval);
	}
}
