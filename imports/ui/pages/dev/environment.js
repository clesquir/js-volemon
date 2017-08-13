import {Template} from 'meteor/templating';
import Environment from '/imports/api/games/client/dev/Environment.js';

import './environment.html';

/** @type {Environment}|null */
let environment = null;

Template.environment.rendered = function() {
	environment = new Environment();
	environment.start();
};

Template.environment.destroyed = function() {
	if (environment) {
		environment.stop();
	}
};
