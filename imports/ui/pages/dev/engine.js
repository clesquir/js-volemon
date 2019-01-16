import Engine from '/imports/api/games/client/dev/Engine';
import './engine.html';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';

/** @var {Engine} */
let engine;
const currentShape = new ReactiveVar('half-circle');
let started = new ReactiveVar(false);

Template.engine.rendered = function() {
	engine = new Engine();
};

Template.engine.destroyed = function() {
	if (engine) {
		engine.stop();
	}
	started.set(false);
};

Template.engine.helpers({
	started: function() {
		return started.get();
	},
	currentShape: function() {
		return currentShape.get();
	}
});

Template.engine.events({
	'click [data-action="start-game"]': function() {
		engine.start();
		started.set(true);
	},
	'click [data-action="change-shape"]': function() {
		let index = PLAYER_LIST_OF_SHAPES.indexOf(currentShape.get()) + 1;

		if (index >= PLAYER_LIST_OF_SHAPES.length) {
			index = 0;
		}

		const newShape = PLAYER_LIST_OF_SHAPES[index];
		currentShape.set(newShape);

		engine.changeDefaultShape(currentShape.get());

		if (started.get()) {
			engine.stop();
			engine.start();
		}
	}
});
