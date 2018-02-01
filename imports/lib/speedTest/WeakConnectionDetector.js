import SpeedTest from '/imports/lib/speedTest/SpeedTest.js';
import {Meteor} from "meteor/meteor";
import {Session} from "meteor/session";

const speedTestInterval = 1000;
const weakConnectionThreshold = 250;

export default class WeakConnectionDetector {
	static start() {
		const speedTest = new SpeedTest();

		Meteor.setInterval(() => {
			speedTest.check(function(connectionSpeed) {
				Session.set('weakConnectionDetected', (connectionSpeed < weakConnectionThreshold));
			});
		}, speedTestInterval);
	}
}
