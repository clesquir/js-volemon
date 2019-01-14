import Engine from '/imports/api/games/client/dev/Engine';
import './engine.html';

/** @var {Engine} */
let engine;

Template.engine.rendered = function() {
	engine = new Engine();
	engine.start();
};
