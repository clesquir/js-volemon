import TestEnvironment from '/client/lib/TestEnvironment.js';

/** @type {TestEnvironment}|null */
var testEnvironment = null;

Template.testEnvironment.rendered = function() {
	testEnvironment = new TestEnvironment();
	testEnvironment.start();
};

Template.testEnvironment.destroyed = function() {
	if (testEnvironment) {
		testEnvironment.stop();
	}
};
