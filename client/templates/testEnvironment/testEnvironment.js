import {Template} from 'meteor/templating';
import TestEnvironment from '/imports/game/client/TestEnvironment.js';

/** @type {TestEnvironment}|null */
let testEnvironment = null;

Template.testEnvironment.rendered = function() {
	testEnvironment = new TestEnvironment();
	testEnvironment.start();
};

Template.testEnvironment.destroyed = function() {
	if (testEnvironment) {
		testEnvironment.stop();
	}
};
