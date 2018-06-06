import Ai from '/imports/api/games/client/dev/Ai.js';
import {Template} from 'meteor/templating';

import './ai.html';

/** @type {Ai}|null */
let ai = null;

Template.ai.rendered = function() {
	ai = new Ai();
	ai.start();
};

Template.ai.destroyed = function() {
	if (ai) {
		ai.stop();
	}
};
