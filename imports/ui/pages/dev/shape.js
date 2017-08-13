import {Template} from 'meteor/templating';
import Shape from '/imports/api/games/client/dev/Shape.js';

import './shape.html';

/** @type {Shape}|null */
let shape = null;

Template.shape.rendered = function() {
	shape = new Shape();
	shape.start();
};

Template.shape.destroyed = function() {
	if (shape) {
		shape.stop();
	}
};
