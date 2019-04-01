import Engine from '/imports/api/games/client/dev/Engine';
import {PLAYER_BIG_SCALE, PLAYER_SCALE, PLAYER_SMALL_SCALE} from '/imports/api/games/constants.js';
import {PLAYER_LIST_OF_SHAPES} from '/imports/api/games/shapeConstants.js';
import './engine.html';

/** @var {Engine} */
let engine;
const currentShape = new ReactiveVar('half-circle');
const currentPlayerScale = new ReactiveVar(PLAYER_SCALE);
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
	},
	currentPlayerScale: function() {
		return currentPlayerScale.get();
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
	},
	'click [data-action="change-player-scale"]': function() {
		switch (currentPlayerScale.get()) {
			case PLAYER_SCALE:
				currentPlayerScale.set(PLAYER_BIG_SCALE);
				break;
			case PLAYER_BIG_SCALE:
				currentPlayerScale.set(PLAYER_SMALL_SCALE);
				break;
			case PLAYER_SMALL_SCALE:
				currentPlayerScale.set(PLAYER_SCALE);
				break;
		}

		engine.changeDefaultScale(currentPlayerScale.get());

		if (started.get()) {
			engine.stop();
			engine.start();
		}
	}
});
